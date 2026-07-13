REVOKE EXECUTE ON FUNCTION public.purge_expired_intruders() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purge_expired_intruders() FROM anon;
REVOKE EXECUTE ON FUNCTION public.purge_expired_intruders() FROM authenticated;