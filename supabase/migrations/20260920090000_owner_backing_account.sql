-- Backing owner account for the /admin login.
--
-- After the admin's username + password (and optional MFA) are verified, the
-- server signs into a backing Supabase auth account to mint the session that
-- the rest of the dashboard uses. Those credentials normally come from the
-- OWNER_ACCOUNT_EMAIL / OWNER_ACCOUNT_PASSWORD environment variables, but they
-- are Lovable-injected secrets that cannot be exported when the project is
-- deployed elsewhere (Vercel, self-hosted).
--
-- When both variables are absent, the server provisions ONE random backing
-- account on first sign-in and stores its credentials in these columns, so the
-- login keeps working with nothing but SUPABASE_* set. Existing RLS already
-- restricts this table to service-role code and signed-in admins.

ALTER TABLE public.admin_credentials
  ADD COLUMN IF NOT EXISTS account_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS account_password text NOT NULL DEFAULT '';
