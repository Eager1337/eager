ALTER TABLE public.ai_site_builds
  ADD COLUMN IF NOT EXISTS build_type text NOT NULL DEFAULT 'site',
  ADD COLUMN IF NOT EXISTS short_name text,
  ADD COLUMN IF NOT EXISTS theme_color text,
  ADD COLUMN IF NOT EXISTS app_icon text,
  ADD COLUMN IF NOT EXISTS apk_url text,
  ADD COLUMN IF NOT EXISTS cloned_from uuid;

CREATE INDEX IF NOT EXISTS ai_site_builds_build_type_idx ON public.ai_site_builds (build_type);

DROP POLICY IF EXISTS "Anyone can read wishlist rows" ON public.wishlist_items;
DROP POLICY IF EXISTS "Anyone can add wishlist rows" ON public.wishlist_items;
DROP POLICY IF EXISTS "Anyone can remove wishlist rows" ON public.wishlist_items;
REVOKE ALL ON public.wishlist_items FROM anon;
CREATE POLICY "Admins manage wishlists" ON public.wishlist_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));