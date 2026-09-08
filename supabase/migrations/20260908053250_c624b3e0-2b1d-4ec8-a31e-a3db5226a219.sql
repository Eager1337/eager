CREATE POLICY "Admins can read login attempts" ON public.admin_login_attempts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION public.purge_expired_intruders() FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.purge_expired_intruders() TO service_role;