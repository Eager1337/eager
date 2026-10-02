-- Improve academic AI readability and persistence for extracted document text.
ALTER TABLE public.academic_documents
  ADD COLUMN IF NOT EXISTS extracted_text text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS academic_documents_owner_status_idx
  ON public.academic_documents(owner_id, ai_status, updated_at DESC);

COMMENT ON COLUMN public.academic_documents.extracted_text IS
  'AI-extracted readable text shown in the admin document reader; source file remains in private storage.';
