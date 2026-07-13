-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Intruder capture events
CREATE TABLE public.intruder_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL DEFAULT '',
  username_tried text NOT NULL DEFAULT '',
  photo text,
  ip text,
  user_agent text,
  language text,
  platform text,
  screen text,
  timezone text
);
GRANT SELECT, DELETE ON public.intruder_events TO authenticated;
GRANT ALL ON public.intruder_events TO service_role;
ALTER TABLE public.intruder_events ENABLE ROW LEVEL SECURITY;
-- Only admins can view captured intruders
CREATE POLICY "Admins can view intruders" ON public.intruder_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Only admins can delete captured intruders
CREATE POLICY "Admins can delete intruders" ON public.intruder_events
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Inserts happen only through the trusted server function (service role); no client insert policy.

-- Brute-force lockout tracking (server-side only)
CREATE TABLE public.admin_login_attempts (
  identifier text PRIMARY KEY,
  fail_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_login_attempts TO service_role;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
-- No client policies: accessed exclusively by the trusted server layer.

-- Privacy / retention settings (single global row)
CREATE TABLE public.privacy_settings (
  id text PRIMARY KEY DEFAULT 'global',
  retention_days integer NOT NULL DEFAULT 0,
  auto_delete boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.privacy_settings TO authenticated;
GRANT ALL ON public.privacy_settings TO service_role;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view privacy settings" ON public.privacy_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update privacy settings" ON public.privacy_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.privacy_settings (id, retention_days, auto_delete) VALUES ('global', 0, false);

-- Automatic retention purge
CREATE OR REPLACE FUNCTION public.purge_expired_intruders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s record;
  deleted integer := 0;
BEGIN
  SELECT retention_days, auto_delete INTO s FROM public.privacy_settings WHERE id = 'global';
  IF s.auto_delete AND s.retention_days > 0 THEN
    DELETE FROM public.intruder_events
      WHERE created_at < now() - make_interval(days => s.retention_days);
    GET DIAGNOSTICS deleted = ROW_COUNT;
  END IF;
  RETURN deleted;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.unschedule('purge-expired-intruders')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-expired-intruders');
SELECT cron.schedule('purge-expired-intruders', '0 3 * * *', $$ SELECT public.purge_expired_intruders(); $$);