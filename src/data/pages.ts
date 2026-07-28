// 50 portfolio pages grouped into 10 sections, all available via /portfolio-os/$slug
export interface PortfolioPage {
  slug: string;
  title: string;
  group: string;
  blurb: string;
}

export const PAGES: PortfolioPage[] = [
  // Brand
  { slug: "home", title: "Home", group: "Brand", blurb: "The flagship landing experience." },
  { slug: "about", title: "About", group: "Brand", blurb: "Who I am and how I work." },
  { slug: "story", title: "Story", group: "Brand", blurb: "Where the obsession came from." },
  { slug: "vision", title: "Vision", group: "Brand", blurb: "What I'm building toward." },
  { slug: "mission", title: "Mission", group: "Brand", blurb: "The job to be done, plainly stated." },
  // Work
  { slug: "projects", title: "Projects", group: "Work", blurb: "Every shipped project, filterable." },
  { slug: "case-studies", title: "Case Studies", group: "Work", blurb: "Long-form stories of the hardest work." },
  { slug: "featured-work", title: "Featured Work", group: "Work", blurb: "The portfolio's greatest hits." },
  { slug: "experiments", title: "Experiments", group: "Work", blurb: "Scrappy prototypes that became products." },
  { slug: "labs", title: "Labs", group: "Work", blurb: "Open research and unfinished ideas." },
  // Proof
  { slug: "results", title: "Results", group: "Proof", blurb: "Hard numbers from real launches." },
  { slug: "metrics", title: "Metrics", group: "Proof", blurb: "Live KPIs from production deployments." },
  { slug: "testimonials", title: "Testimonials", group: "Proof", blurb: "What clients and partners say." },
  { slug: "awards", title: "Awards", group: "Proof", blurb: "Recognition from the industry." },
  { slug: "press", title: "Press", group: "Proof", blurb: "Media mentions, podcasts and interviews." },
  // Technical
  { slug: "stack", title: "Stack", group: "Technical", blurb: "Every tool, framework and language I use." },
  { slug: "architecture", title: "Architecture", group: "Technical", blurb: "How the systems are built." },
  { slug: "api-showcase", title: "API Showcase", group: "Technical", blurb: "Live demos of APIs I've shipped." },
  { slug: "component-library", title: "Component Library", group: "Technical", blurb: "Reusable design system components." },
  { slug: "open-source", title: "Open Source", group: "Technical", blurb: "Code I've released to the world." },
  // Commercial
  { slug: "services", title: "Services", group: "Commercial", blurb: "What I can ship for you." },
  { slug: "pricing", title: "Pricing", group: "Commercial", blurb: "Transparent project pricing." },
  { slug: "consulting", title: "Consulting", group: "Commercial", blurb: "Strategic engagements at the founder level." },
  { slug: "partnerships", title: "Partnerships", group: "Commercial", blurb: "Long-term partnership tiers." },
  { slug: "investor-relations", title: "Investor Relations", group: "Commercial", blurb: "For accredited investors only." },
  // Creative
  { slug: "design-system", title: "Design System", group: "Creative", blurb: "Tokens, motion and component primitives." },
  { slug: "motion-gallery", title: "Motion Gallery", group: "Creative", blurb: "Curated animation reel." },
  { slug: "brand-studio", title: "Brand Studio", group: "Creative", blurb: "Identity work for product brands." },
  { slug: "concept-archive", title: "Concept Archive", group: "Creative", blurb: "Unshipped concepts and explorations." },
  { slug: "story-engine", title: "Story Engine", group: "Creative", blurb: "Narrative frameworks for products." },
  // Community
  { slug: "blog", title: "Blog", group: "Community", blurb: "Long-form essays on craft." },
  { slug: "events", title: "Events", group: "Community", blurb: "Talks, workshops and meetups." },
  { slug: "newsletter", title: "Newsletter", group: "Community", blurb: "Weekly deep-dives delivered Friday." },
  { slug: "tutorials", title: "Tutorials", group: "Community", blurb: "Free, in-depth tutorials." },
  { slug: "mentorship", title: "Mentorship", group: "Community", blurb: "1:1 mentorship for engineers and designers." },
  // Interactive
  { slug: "playground", title: "Playground", group: "Interactive", blurb: "Live, editable code playgrounds." },
  { slug: "ai-assistant", title: "AI Assistant", group: "Interactive", blurb: "Ask anything about my work." },
  { slug: "workspace", title: "Workspace", group: "Interactive", blurb: "A peek into the live workspace." },
  { slug: "resource-vault", title: "Resource Vault", group: "Interactive", blurb: "Curated tools, books and links." },
  { slug: "downloads", title: "Downloads", group: "Interactive", blurb: "Free templates and assets." },
  // Professional
  { slug: "resume", title: "Resume", group: "Professional", blurb: "Generates a tailored resume PDF." },
  { slug: "roadmap", title: "Roadmap", group: "Professional", blurb: "Where I'm heading in the next 18 months." },
  { slug: "contact", title: "Contact", group: "Professional", blurb: "The fastest way to reach me." },
  { slug: "faq", title: "FAQ", group: "Professional", blurb: "Common questions, real answers." },
  { slug: "client-portal", title: "Client Portal", group: "Professional", blurb: "Login for active clients." },
  // Premium
  { slug: "investor-deck", title: "Investor Deck", group: "Premium", blurb: "The deck I share with investors." },
  { slug: "portfolio-analytics", title: "Portfolio Analytics", group: "Premium", blurb: "Live analytics about this portfolio itself." },
  { slug: "demo-room", title: "Demo Room", group: "Premium", blurb: "Interactive product demos." },
  { slug: "live-showcase", title: "Live Showcase", group: "Premium", blurb: "Real-time stream of what I'm building now." },
  { slug: "private-access", title: "Private Access", group: "Premium", blurb: "Invite-only deep dives." },
  // Admin
  { slug: "admin-overview", title: "Admin Overview", group: "Admin", blurb: "Command centre for the whole portfolio: uptime, traffic and pending actions at a glance." },
  { slug: "admin-security-log", title: "Security Log", group: "Admin", blurb: "Every login attempt, lockout and intruder capture in one auditable timeline." },
  { slug: "admin-media-manager", title: "Media Manager", group: "Admin", blurb: "Upload, replace and map portfolio images and video to their slots, including bulk zip import." },
  { slug: "admin-visitor-insights", title: "Visitor Insights", group: "Admin", blurb: "Who visited, what they opened and which case studies pulled the most attention." },
  { slug: "admin-content-studio", title: "Content Studio", group: "Admin", blurb: "Edit copy, metrics and testimonials across the site without touching code." },
];

export const PAGE_GROUPS = [
  "Brand", "Work", "Proof", "Technical", "Commercial",
  "Creative", "Community", "Interactive", "Professional", "Premium",
  "Admin",
];

export function getPage(slug: string): PortfolioPage | undefined {
  return PAGES.find((p) => p.slug === slug);
}