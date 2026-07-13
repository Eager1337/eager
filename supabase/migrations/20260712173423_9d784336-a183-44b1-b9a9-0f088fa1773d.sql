-- Restrict SECURITY DEFINER maintenance functions so signed-in users cannot call them directly.
-- (has_role must stay executable by authenticated because RLS policies evaluate it.)
REVOKE EXECUTE ON FUNCTION public.purge_expired_intruders() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Explicit access control for the private portfolio-media bucket.
-- Only admins may manage objects; public reads are served through the
-- /api/public/media route using the service role, so no anon policy is needed.
DROP POLICY IF EXISTS "Admins manage portfolio media" ON storage.objects;
CREATE POLICY "Admins manage portfolio media"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));