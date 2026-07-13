REVOKE EXECUTE ON FUNCTION public.purge_expired_intruders() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;