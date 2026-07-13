CREATE TABLE public.portfolio_assets (
  key text NOT NULL PRIMARY KEY,
  url text NOT NULL,
  content_type text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portfolio_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_assets TO authenticated;
GRANT ALL ON public.portfolio_assets TO service_role;

ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio assets"
  ON public.portfolio_assets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert portfolio assets"
  ON public.portfolio_assets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update portfolio assets"
  ON public.portfolio_assets FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete portfolio assets"
  ON public.portfolio_assets FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_portfolio_assets_updated_at
  BEFORE UPDATE ON public.portfolio_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();