CREATE TABLE IF NOT EXISTS public.admin_project_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled project',
  provider text NOT NULL DEFAULT 'link',
  source_url text NOT NULL DEFAULT '',
  preview_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'connected',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.admin_project_sources(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_key text NOT NULL UNIQUE,
  content_type text NOT NULL DEFAULT 'application/octet-stream',
  size_bytes bigint NOT NULL DEFAULT 0,
  url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_project_sources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_project_files TO authenticated;
GRANT ALL ON public.admin_project_sources TO service_role;
GRANT ALL ON public.admin_project_files TO service_role;

ALTER TABLE public.admin_project_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage project sources" ON public.admin_project_sources;
CREATE POLICY "Admins manage project sources" ON public.admin_project_sources
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage project files" ON public.admin_project_files;
CREATE POLICY "Admins manage project files" ON public.admin_project_files
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS admin_project_sources_provider_idx ON public.admin_project_sources(provider);
CREATE INDEX IF NOT EXISTS admin_project_files_source_id_idx ON public.admin_project_files(source_id);

DROP TRIGGER IF EXISTS admin_project_sources_updated_at ON public.admin_project_sources;
CREATE TRIGGER admin_project_sources_updated_at
  BEFORE UPDATE ON public.admin_project_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
