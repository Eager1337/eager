CREATE TABLE public.cv_profile (
  id text PRIMARY KEY DEFAULT 'global',
  full_name text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  experience jsonb NOT NULL DEFAULT '[]'::jsonb,
  education jsonb NOT NULL DEFAULT '[]'::jsonb,
  certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ratings jsonb NOT NULL DEFAULT '[]'::jsonb,
  file_url text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cv_profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_profile TO authenticated;
GRANT ALL ON public.cv_profile TO service_role;

ALTER TABLE public.cv_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CV is publicly readable" ON public.cv_profile
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage the CV" ON public.cv_profile
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER cv_profile_updated_at BEFORE UPDATE ON public.cv_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cv_profile (id, full_name, headline, summary, location, email, website, skills, experience, education, certifications, languages, ratings)
VALUES (
  'global',
  'Alusine G. Dumbuya',
  'Full-Stack Developer, Systems Builder & Video Editor',
  'I build production systems: web platforms, internal dashboards, secure admin tooling and the operations behind them.',
  'Freetown, Sierra Leone',
  'contact@eagerbeaver.dev',
  'https://eager.lovable.app',
  '["React","TypeScript","Node.js","Postgres","Tailwind CSS","Supabase","Cloud deployment","Video editing"]'::jsonb,
  '[{"role":"Founder & Lead Engineer","org":"Eager Beaver Studio","period":"2022 - present","detail":"Design and ship full-stack products for clients across logistics, education and media."}]'::jsonb,
  '[{"school":"Self-directed engineering track","credential":"Full-stack engineering","period":"2020 - present"}]'::jsonb,
  '["Network fundamentals","Cybersecurity essentials"]'::jsonb,
  '["English","Krio"]'::jsonb,
  '[{"label":"Delivery on time","score":4.9},{"label":"Code quality","score":5.0},{"label":"Communication","score":4.8},{"label":"Value for budget","score":4.9}]'::jsonb
);