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
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE TABLE public.intruder_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL DEFAULT '',
  username_tried text NOT NULL DEFAULT '',
  photo text, ip text, user_agent text, language text, platform text, screen text, timezone text,
  latitude double precision, longitude double precision, accuracy double precision, location_label text
);
GRANT SELECT, DELETE ON public.intruder_events TO authenticated;
GRANT ALL ON public.intruder_events TO service_role;
ALTER TABLE public.intruder_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view intruders" ON public.intruder_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete intruders" ON public.intruder_events
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_login_attempts (
  identifier text PRIMARY KEY,
  fail_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_login_attempts TO service_role;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.privacy_settings (
  id text PRIMARY KEY DEFAULT 'global',
  retention_days integer NOT NULL DEFAULT 0,
  auto_delete boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_cleanup_at timestamptz,
  last_cleanup_count integer,
  last_cleanup_ok boolean
);
GRANT SELECT ON public.privacy_settings TO authenticated;
GRANT ALL ON public.privacy_settings TO service_role;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view privacy settings" ON public.privacy_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update privacy settings" ON public.privacy_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.privacy_settings (id, retention_days, auto_delete) VALUES ('global', 0, false);

CREATE OR REPLACE FUNCTION public.purge_expired_intruders()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE s record; deleted integer := 0;
BEGIN
  SELECT retention_days, auto_delete INTO s FROM public.privacy_settings WHERE id = 'global';
  IF s.auto_delete AND s.retention_days > 0 THEN
    DELETE FROM public.intruder_events WHERE created_at < now() - make_interval(days => s.retention_days);
    GET DIAGNOSTICS deleted = ROW_COUNT;
  END IF;
  UPDATE public.privacy_settings SET last_cleanup_at = now(), last_cleanup_count = deleted, last_cleanup_ok = true WHERE id = 'global';
  RETURN deleted;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('purge-expired-intruders', '0 3 * * *', $$ SELECT public.purge_expired_intruders(); $$);

CREATE TABLE public.security_settings (
  id text PRIMARY KEY DEFAULT 'global',
  max_fails integer NOT NULL DEFAULT 5,
  lock_minutes integer NOT NULL DEFAULT 15,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.security_settings TO authenticated;
GRANT ALL ON public.security_settings TO service_role;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view security settings" ON public.security_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update security settings" ON public.security_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.security_settings (id) VALUES ('global');

CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  target_id text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.portfolio_assets (
  key text PRIMARY KEY,
  url text NOT NULL,
  content_type text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_assets TO authenticated;
GRANT ALL ON public.portfolio_assets TO service_role;
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view portfolio assets" ON public.portfolio_assets
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert portfolio assets" ON public.portfolio_assets
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update portfolio assets" ON public.portfolio_assets
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete portfolio assets" ON public.portfolio_assets
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_portfolio_assets_updated_at
  BEFORE UPDATE ON public.portfolio_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

REVOKE EXECUTE ON FUNCTION public.purge_expired_intruders() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "Admins manage portfolio media"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));
