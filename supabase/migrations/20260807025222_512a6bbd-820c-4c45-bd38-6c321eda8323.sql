-- =========================
-- MARKETPLACE
-- =========================
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'Template',
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  image_url text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '1.0.0',
  changelog text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  downloads_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.product_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  discount_label text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  product_slugs text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_bundles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_bundles TO authenticated;
GRANT ALL ON public.product_bundles TO service_role;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active bundles" ON public.product_bundles FOR SELECT USING (active = true);
CREATE POLICY "Admins manage bundles" ON public.product_bundles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER product_bundles_updated_at BEFORE UPDATE ON public.product_bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  author_email text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  body text NOT NULL DEFAULT '',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (approved = true);
CREATE POLICY "Admins manage reviews" ON public.product_reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER product_reviews_updated_at BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.product_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  license_key text NOT NULL UNIQUE,
  customer_name text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  activations integer NOT NULL DEFAULT 0,
  max_activations integer NOT NULL DEFAULT 3,
  expires_on date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_licenses TO authenticated;
GRANT ALL ON public.product_licenses TO service_role;
ALTER TABLE public.product_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage licenses" ON public.product_licenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER product_licenses_updated_at BEFORE UPDATE ON public.product_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, product_slug)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read wishlist rows" ON public.wishlist_items FOR SELECT USING (true);
CREATE POLICY "Anyone can add wishlist rows" ON public.wishlist_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove wishlist rows" ON public.wishlist_items FOR DELETE USING (true);

-- =========================
-- ADMIN SECURITY (2FA / PASSKEYS / ALERTS)
-- =========================
CREATE TABLE public.admin_totp (
  id text PRIMARY KEY DEFAULT 'global',
  secret text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT false,
  recovery_codes text[] NOT NULL DEFAULT '{}',
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.admin_totp TO authenticated;
GRANT ALL ON public.admin_totp TO service_role;
ALTER TABLE public.admin_totp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read totp state" ON public.admin_totp FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update totp state" ON public.admin_totp FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER admin_totp_updated_at BEFORE UPDATE ON public.admin_totp
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.admin_totp (id) VALUES ('global');

CREATE TABLE public.admin_passkeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT 'Passkey',
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  algorithm integer NOT NULL DEFAULT -7,
  sign_count bigint NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_passkeys TO authenticated;
GRANT ALL ON public.admin_passkeys TO service_role;
ALTER TABLE public.admin_passkeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage passkeys" ON public.admin_passkeys FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER admin_passkeys_updated_at BEFORE UPDATE ON public.admin_passkeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.admin_alert_settings (
  id text PRIMARY KEY DEFAULT 'global',
  email text NOT NULL DEFAULT '',
  alert_on_success boolean NOT NULL DEFAULT true,
  alert_on_failure boolean NOT NULL DEFAULT true,
  alert_on_new_device boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.admin_alert_settings TO authenticated;
GRANT ALL ON public.admin_alert_settings TO service_role;
ALTER TABLE public.admin_alert_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read alert settings" ON public.admin_alert_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update alert settings" ON public.admin_alert_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER admin_alert_settings_updated_at BEFORE UPDATE ON public.admin_alert_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.admin_alert_settings (id) VALUES ('global');

CREATE TABLE public.login_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  identifier text NOT NULL DEFAULT '',
  detail text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'info',
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.login_alerts TO authenticated;
GRANT ALL ON public.login_alerts TO service_role;
ALTER TABLE public.login_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read login alerts" ON public.login_alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update login alerts" ON public.login_alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete login alerts" ON public.login_alerts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- AI WEBSITE BUILDER
-- =========================
CREATE TABLE public.ai_site_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Untitled site',
  prompt text NOT NULL DEFAULT '',
  html text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_site_builds TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_site_builds TO authenticated;
GRANT ALL ON public.ai_site_builds TO service_role;
ALTER TABLE public.ai_site_builds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published builds" ON public.ai_site_builds FOR SELECT USING (published = true);
CREATE POLICY "Admins manage builds" ON public.ai_site_builds FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER ai_site_builds_updated_at BEFORE UPDATE ON public.ai_site_builds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- SEED MARKETPLACE
-- =========================
INSERT INTO public.products (name, slug, category, summary, description, price, image_url, file_url, version, changelog, tags, featured) VALUES
('Portfolio OS Starter Kit', 'portfolio-os-starter', 'Template', 'The production React and TypeScript portfolio system behind this site.', 'A complete portfolio operating system: routing, animated hero, project case studies, admin dashboard shell, analytics hooks and deployment scripts. Built with React, TypeScript, Tailwind and TanStack Start.', 149, '', '', '2.1.0', 'v2.1.0 added the investor suite and press kit modules.', ARRAY['react','typescript','tailwind','portfolio'], true),
('Investor Pitch Deck System', 'investor-deck-system', 'Template', 'A 14 slide investor deck template plus the metrics model behind it.', 'Executive summary, market sizing, competitor grid, traction charts and a live metrics spreadsheet. Includes the PDF export pipeline used on this site.', 89, '', '', '1.4.0', 'v1.4.0 added the competitor comparison grid.', ARRAY['investor','deck','pdf'], true),
('Admin Command Center UI Kit', 'admin-command-center', 'UI Kit', 'Dark, glassy admin dashboard components for real products.', 'Sidebar navigation, KPI cards, CRUD record manager, chart shells, signature pad, media uploader and mobile hardened tables. Drop-in React components with Tailwind tokens.', 119, '', '', '1.8.0', 'v1.8.0 added the record manager and signature pad.', ARRAY['admin','dashboard','ui'], false),
('Motion Section Library', 'motion-section-library', 'UI Kit', 'Thirty scroll reveal sections with reduced motion support.', 'Hero variants, feature grids, testimonial stacks, pricing tables and orbiting cards. Every section respects prefers-reduced-motion and ships accessible markup.', 69, '', '', '1.2.0', 'v1.2.0 added the orbiting cards section.', ARRAY['animation','motion','sections'], false),
('Client Ops Playbook', 'client-ops-playbook', 'Playbook', 'The proposal, contract and onboarding system I run on real client work.', 'Proposal templates, scope language that prevents creep, contract clauses, onboarding checklist, milestone tracker and handover documentation templates.', 49, '', '', '3.0.0', 'v3.0.0 rewrote the scope and change request language.', ARRAY['business','proposals','contracts'], false);

INSERT INTO public.product_bundles (name, slug, summary, price, discount_label, product_slugs) VALUES
('Founder Bundle', 'founder-bundle', 'Everything needed to launch a credible product presence: portfolio system, deck system and client playbook.', 239, 'Save 21%', ARRAY['portfolio-os-starter','investor-deck-system','client-ops-playbook']),
('Builder Bundle', 'builder-bundle', 'The full front-end kit: admin command center plus the motion section library.', 149, 'Save 20%', ARRAY['admin-command-center','motion-section-library']);