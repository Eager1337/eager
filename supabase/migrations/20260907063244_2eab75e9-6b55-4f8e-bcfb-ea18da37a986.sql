CREATE TABLE public.admin_credentials (
  id text PRIMARY KEY DEFAULT 'global',
  username text NOT NULL DEFAULT '',
  password_hash text NOT NULL DEFAULT '',
  salt text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.admin_credentials TO authenticated;
GRANT ALL ON public.admin_credentials TO service_role;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage credentials" ON public.admin_credentials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER admin_credentials_updated_at BEFORE UPDATE ON public.admin_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.ai_site_builds
  ADD COLUMN IF NOT EXISTS summary text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_image text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_kind text NOT NULL DEFAULT 'prompt',
  ADD COLUMN IF NOT EXISTS source_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;