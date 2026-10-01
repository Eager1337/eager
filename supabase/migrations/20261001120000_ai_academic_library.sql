-- AI academic library: private admin-only course folders, documents and timetable entries.

CREATE TABLE IF NOT EXISTS public.academic_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL DEFAULT '',
  name text NOT NULL,
  department text NOT NULL DEFAULT '',
  semester text NOT NULL DEFAULT '',
  academic_year text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '#38bdf8',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS academic_subjects_owner_code_name_idx
  ON public.academic_subjects(owner_id, lower(code), lower(name));

CREATE TABLE IF NOT EXISTS public.academic_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.academic_subjects(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  file_size bigint NOT NULL DEFAULT 0,
  storage_path text NOT NULL,
  document_type text NOT NULL DEFAULT 'other',
  title text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  lecturer text NOT NULL DEFAULT '',
  due_date date,
  semester text NOT NULL DEFAULT '',
  academic_year text NOT NULL DEFAULT '',
  ai_confidence numeric(4,3),
  ai_status text NOT NULL DEFAULT 'processed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academic_documents_owner_subject_idx
  ON public.academic_documents(owner_id, subject_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.academic_schedule_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.academic_subjects(id) ON DELETE SET NULL,
  document_id uuid REFERENCES public.academic_documents(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text NOT NULL DEFAULT '',
  lecturer text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academic_schedule_owner_day_idx
  ON public.academic_schedule_entries(owner_id, day_of_week, start_time);

ALTER TABLE public.academic_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_schedule_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage own academic subjects" ON public.academic_subjects;
CREATE POLICY "Admins manage own academic subjects"
ON public.academic_subjects FOR ALL TO authenticated
USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage own academic documents" ON public.academic_documents;
CREATE POLICY "Admins manage own academic documents"
ON public.academic_documents FOR ALL TO authenticated
USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage own academic schedule" ON public.academic_schedule_entries;
CREATE POLICY "Admins manage own academic schedule"
ON public.academic_schedule_entries FOR ALL TO authenticated
USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.academic_subjects, public.academic_documents, public.academic_schedule_entries FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_subjects, public.academic_documents, public.academic_schedule_entries TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-library', 'academic-library', false)
ON CONFLICT (id) DO UPDATE SET public = false;
