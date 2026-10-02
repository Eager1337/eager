DROP POLICY IF EXISTS "CV is publicly readable" ON public.cv_profile;
REVOKE SELECT ON public.cv_profile FROM anon;
GRANT ALL ON public.cv_profile TO service_role;