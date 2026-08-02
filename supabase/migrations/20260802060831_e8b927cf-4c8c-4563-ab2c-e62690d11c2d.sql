-- CLIENTS
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  billing_info text NOT NULL DEFAULT '',
  contract_notes text NOT NULL DEFAULT '',
  project_notes text NOT NULL DEFAULT '',
  communication_log text NOT NULL DEFAULT '',
  feedback text NOT NULL DEFAULT '',
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  reminder text NOT NULL DEFAULT '',
  follow_up_at timestamptz,
  status text NOT NULL DEFAULT 'lead',
  priority text NOT NULL DEFAULT 'medium',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CLIENT PROJECTS
CREATE TABLE public.client_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  summary text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'active',
  progress integer NOT NULL DEFAULT 0,
  deadline date,
  budget text NOT NULL DEFAULT '',
  estimated_hours numeric NOT NULL DEFAULT 0,
  completed_hours numeric NOT NULL DEFAULT 0,
  milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements text NOT NULL DEFAULT '',
  meeting_notes text NOT NULL DEFAULT '',
  deployment_notes text NOT NULL DEFAULT '',
  api_docs text NOT NULL DEFAULT '',
  design_assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  repo_url text NOT NULL DEFAULT '',
  live_url text NOT NULL DEFAULT '',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_projects TO authenticated;
GRANT ALL ON public.client_projects TO service_role;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage client projects" ON public.client_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER client_projects_updated_at BEFORE UPDATE ON public.client_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- WORKSPACE TOOLS
CREATE TABLE public.workspace_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  notes text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  favorite boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  last_opened_at timestamptz,
  open_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_tools TO authenticated;
GRANT ALL ON public.workspace_tools TO service_role;
ALTER TABLE public.workspace_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage workspace tools" ON public.workspace_tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER workspace_tools_updated_at BEFORE UPDATE ON public.workspace_tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- KNOWLEDGE BASE
CREATE TABLE public.knowledge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'note',
  url text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}'::text[],
  favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_items TO authenticated;
GRANT ALL ON public.knowledge_items TO service_role;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage knowledge items" ON public.knowledge_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER knowledge_items_updated_at BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SITE VISITS
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL DEFAULT '',
  path text NOT NULL DEFAULT '/',
  referrer text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  browser text NOT NULL DEFAULT '',
  os text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT '',
  timezone text NOT NULL DEFAULT '',
  screen text NOT NULL DEFAULT '',
  is_returning boolean NOT NULL DEFAULT false,
  ip text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_visits TO authenticated;
GRANT ALL ON public.site_visits TO service_role;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view site visits" ON public.site_visits FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX site_visits_created_at_idx ON public.site_visits (created_at DESC);