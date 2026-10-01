ALTER TABLE public.admin_credentials
  ADD COLUMN IF NOT EXISTS account_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS account_password text NOT NULL DEFAULT '';

DROP POLICY IF EXISTS "Anyone can request a booking" ON public.bookings;
CREATE POLICY "Anyone can request a booking" ON public.bookings FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'requested' AND value = 0
  AND length(name) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 320
  AND length(notes) <= 5000 AND length(session_type) <= 100
);

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 320
  AND coalesce(length(name),0) <= 200 AND coalesce(length(company),0) <= 200
  AND coalesce(length(message),0) <= 5000 AND coalesce(length(budget),0) <= 100
  AND notes IS NULL AND cv_link_sent = false AND welcome_email_status = 'queued'
  AND cardinality(services) <= 30
);

DROP POLICY IF EXISTS "Anyone can view portfolio assets" ON public.portfolio_assets;
CREATE POLICY "Anyone can view published portfolio assets" ON public.portfolio_assets FOR SELECT TO anon, authenticated
USING (url IS NOT NULL AND length(url) > 0 AND key IS NOT NULL);