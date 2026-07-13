-- 1. Location columns on intruder_events
ALTER TABLE public.intruder_events
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS accuracy double precision,
  ADD COLUMN IF NOT EXISTS location_label text;

-- 2. Cleanup-run reporting columns on privacy_settings
ALTER TABLE public.privacy_settings
  ADD COLUMN IF NOT EXISTS last_cleanup_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_cleanup_count integer,
  ADD COLUMN IF NOT EXISTS last_cleanup_ok boolean;

-- 3. Configurable brute-force protection settings
CREATE TABLE IF NOT EXISTS public.security_settings (
  id text NOT NULL DEFAULT 'global' PRIMARY KEY,
  max_fails integer NOT NULL DEFAULT 5,
  lock_minutes integer NOT NULL DEFAULT 15,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.security_settings TO authenticated;
GRANT ALL ON public.security_settings TO service_role;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view security settings"
  ON public.security_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update security settings"
  ON public.security_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
INSERT INTO public.security_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- 4. Admin audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  target_id text,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Cleanup routine now reports its result into privacy_settings
CREATE OR REPLACE FUNCTION public.purge_expired_intruders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  UPDATE public.privacy_settings
    SET last_cleanup_at = now(),
        last_cleanup_count = deleted,
        last_cleanup_ok = true
    WHERE id = 'global';
  RETURN deleted;
END;
$function$;