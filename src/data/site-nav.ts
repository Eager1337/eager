export type NavItem = { label: string; to: string; note: string };

/** The full portfolio map. Every entry resolves to a real route. */
export const SITE_NAV: NavItem[] = [
  { label: "Home", to: "/", note: "ToonHub hero and collection" },
  { label: "About", to: "/portfolio", note: "The portfolio book" },
  { label: "Projects", to: "/projects", note: "Everything shipped" },
  { label: "Project Details", to: "/projects/datacore", note: "Deep dive on one build" },
  { label: "Case Studies", to: "/case-studies", note: "Outcome-led write-ups" },
  { label: "Services", to: "/services", note: "How I work with clients" },
  { label: "Digital Marketplace", to: "/marketplace", note: "Templates and systems" },
  { label: "Book a Consultation", to: "/book", note: "Pick a session" },
  { label: "Resume", to: "/cv", note: "Download the CV" },
  { label: "Skills & Technologies", to: "/skills", note: "The full stack" },
  { label: "Blog", to: "/blog", note: "Engineering notes" },
  { label: "Testimonials", to: "/testimonials", note: "Client words" },
  { label: "Contact", to: "/contact", note: "Send a brief" },
  { label: "Investor Relations", to: "/investor", note: "Traction and roadmap" },
  { label: "Investor Press Kit", to: "/press-kit", note: "Deck, metrics, press assets" },
  { label: "Open Source", to: "/open-source", note: "Public code" },
  { label: "Certifications", to: "/certifications", note: "Verified credentials" },
  { label: "Resources", to: "/resources", note: "Free downloads" },
  { label: "FAQs", to: "/faqs", note: "Common questions" },
  { label: "Privacy Policy", to: "/privacy", note: "How data is handled" },
  { label: "Dashboard Login", to: "/admin", note: "Owner command center" },
];
