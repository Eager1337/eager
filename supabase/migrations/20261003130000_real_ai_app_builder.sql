-- Real AI App Builder project model
ALTER TABLE public.ai_site_builds
  ADD COLUMN IF NOT EXISTS framework text NOT NULL DEFAULT 'html',
  ADD COLUMN IF NOT EXISTS project_files jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dependencies jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS entry_file text NOT NULL DEFAULT 'index.html',
  ADD COLUMN IF NOT EXISTS build_version integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS ai_site_builds_build_type_idx
  ON public.ai_site_builds(build_type);

COMMENT ON COLUMN public.ai_site_builds.project_files IS
  'Virtual project filesystem for AI-generated apps. Keys are relative paths and values are UTF-8 file contents.';
