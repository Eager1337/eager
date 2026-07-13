// 50 investor-grade features grouped into 5 buckets

export interface Feature {
  id: number;
  name: string;
  group: "Identity & Story" | "Trust & Credibility" | "Portfolio Intelligence" | "Experience & Engagement" | "Business & Conversion";
  description: string;
  icon: string; // lucide icon name
  status: "live" | "beta" | "soon";
}

export const FEATURES: Feature[] = [
  // Identity & Story
  { id: 1, name: "Cinematic landing hero", group: "Identity & Story", description: "Looping ninja-tortoise hero with cursor reveal and magnetic CTAs.", icon: "Play", status: "live" },
  { id: 2, name: "Animated mission statement", group: "Identity & Story", description: "Word-by-word reveal of the founder's mission.", icon: "Sparkles", status: "live" },
  { id: 3, name: "Founder timeline", group: "Identity & Story", description: "Interactive horizontal timeline of milestones.", icon: "Milestone", status: "live" },
  { id: 4, name: "Why I build", group: "Identity & Story", description: "Manifesto page explaining the why behind every project.", icon: "Flame", status: "live" },
  { id: 5, name: "Interactive origin story", group: "Identity & Story", description: "Chapter-based scroll story of how it started.", icon: "BookOpen", status: "live" },
  { id: 6, name: "Values dashboard", group: "Identity & Story", description: "Live scorecard of the principles guiding every decision.", icon: "Compass", status: "live" },
  { id: 7, name: "Career roadmap", group: "Identity & Story", description: "Visual roadmap from today to 5-year vision.", icon: "Route", status: "live" },
  { id: 8, name: "Digital resume engine", group: "Identity & Story", description: "Generates a tailored resume PDF per audience.", icon: "FileText", status: "live" },
  { id: 9, name: "Achievement map", group: "Identity & Story", description: "World map showing where work has shipped.", icon: "Globe2", status: "live" },
  { id: 10, name: "Personal documentary", group: "Identity & Story", description: "Embedded short documentary about the journey.", icon: "Clapperboard", status: "beta" },

  // Trust & Credibility
  { id: 11, name: "Verified project metrics", group: "Trust & Credibility", description: "Third-party signed metric badges on every case study.", icon: "BadgeCheck", status: "live" },
  { id: 12, name: "Client testimonials", group: "Trust & Credibility", description: "Video and quote testimonials with LinkedIn verification.", icon: "Quote", status: "live" },
  { id: 13, name: "Live deployment badges", group: "Trust & Credibility", description: "Real-time uptime and traffic badges from production sites.", icon: "Activity", status: "live" },
  { id: 14, name: "Availability status", group: "Trust & Credibility", description: "Live indicator showing current capacity for new projects.", icon: "Clock", status: "live" },
  { id: 15, name: "Capability deck (PDF)", group: "Trust & Credibility", description: "Downloadable investor-grade capability deck.", icon: "Download", status: "live" },
  { id: 16, name: "Case study viewer", group: "Trust & Credibility", description: "Long-form, embeddable case studies with chapters.", icon: "Layers", status: "live" },
  { id: 17, name: "Project impact calculator", group: "Trust & Credibility", description: "Interactive ROI calculator per case study.", icon: "Calculator", status: "live" },
  { id: 18, name: "Milestone tracker", group: "Trust & Credibility", description: "Public roadmap of upcoming and shipped work.", icon: "Flag", status: "live" },
  { id: 19, name: "Certifications page", group: "Trust & Credibility", description: "Verified certifications and skill badges.", icon: "Award", status: "live" },
  { id: 20, name: "Media mentions", group: "Trust & Credibility", description: "Press, podcasts and interviews in one feed.", icon: "Megaphone", status: "live" },

  // Portfolio Intelligence
  { id: 21, name: "AI project search", group: "Portfolio Intelligence", description: "Ask in plain English, finds the right case study.", icon: "Search", status: "live" },
  { id: 22, name: "Recommendation engine", group: "Portfolio Intelligence", description: "Suggests projects based on what investors have viewed.", icon: "Sparkle", status: "live" },
  { id: 23, name: "Skill heatmap", group: "Portfolio Intelligence", description: "Color-coded heatmap of skills by depth of experience.", icon: "Grid3x3", status: "live" },
  { id: 24, name: "Tech stack explorer", group: "Portfolio Intelligence", description: "Interactive graph of every technology used across projects.", icon: "Cpu", status: "live" },
  { id: 25, name: "Analytics dashboard", group: "Portfolio Intelligence", description: "Live traffic, engagement and conversion from this portfolio.", icon: "BarChart3", status: "live" },
  { id: 26, name: "Dynamic filters", group: "Portfolio Intelligence", description: "Filter projects by industry, stack, scale and role.", icon: "Filter", status: "live" },
  { id: 27, name: "Compare projects mode", group: "Portfolio Intelligence", description: "Side-by-side compare any two case studies.", icon: "GitCompare", status: "live" },
  { id: 28, name: "Problem → Solution explorer", group: "Portfolio Intelligence", description: "Browse only by the problem you're trying to solve.", icon: "Lightbulb", status: "live" },
  { id: 29, name: "Architecture visualizer", group: "Portfolio Intelligence", description: "Interactive system diagrams per project.", icon: "Network", status: "live" },
  { id: 30, name: "Investor mode toggle", group: "Portfolio Intelligence", description: "Surfaces only metrics, ROI and capability, hides fluff.", icon: "Crown", status: "live" },

  // Experience & Engagement
  { id: 31, name: "Full dark / light themes", group: "Experience & Engagement", description: "Auto-adapting theme with manual override.", icon: "SunMoon", status: "live" },
  { id: 32, name: "Smooth page transitions", group: "Experience & Engagement", description: "Framer Motion route transitions that feel native.", icon: "ArrowLeftRight", status: "live" },
  { id: 33, name: "Voice narration mode", group: "Experience & Engagement", description: "Listen to any case study, hands-free.", icon: "Mic", status: "beta" },
  { id: 34, name: "Portfolio trailer video", group: "Experience & Engagement", description: "60-second cinematic trailer of the work.", icon: "Film", status: "live" },
  { id: 35, name: "3D scene showcase", group: "Experience & Engagement", description: "WebGL scenes embedded in flagship case studies.", icon: "Boxes", status: "live" },
  { id: 36, name: "Scroll storytelling", group: "Experience & Engagement", description: "Scroll-bound chapters with synchronized motion.", icon: "MousePointer2", status: "live" },
  { id: 37, name: "Workspace preview", group: "Experience & Engagement", description: "Peek into the actual workspace where things get built.", icon: "Monitor", status: "live" },
  { id: 38, name: "Keyboard shortcuts", group: "Experience & Engagement", description: "Navigate the entire portfolio with shortcuts (press ?).", icon: "Keyboard", status: "live" },
  { id: 39, name: "Command palette (⌘K)", group: "Experience & Engagement", description: "Jump to any page or project in two keystrokes.", icon: "Command", status: "live" },
  { id: 40, name: "Interactive onboarding", group: "Experience & Engagement", description: "Guided tour for first-time investors.", icon: "MapPin", status: "live" },

  // Business & Conversion
  { id: 41, name: "Book a project workflow", group: "Business & Conversion", description: "Multi-step workflow that scopes and prices a project.", icon: "Rocket", status: "live" },
  { id: 42, name: "Quote estimator", group: "Business & Conversion", description: "Real-time quote based on scope, timeline and platform.", icon: "DollarSign", status: "live" },
  { id: 43, name: "Service marketplace", group: "Business & Conversion", description: "Productized services with instant checkout.", icon: "ShoppingBag", status: "live" },
  { id: 44, name: "Discovery call scheduler", group: "Business & Conversion", description: "Book a 30-min discovery call, auto-confirmed.", icon: "Calendar", status: "live" },
  { id: 45, name: "Investor inquiry form", group: "Business & Conversion", description: "Private form for investors with NDA option.", icon: "Briefcase", status: "live" },
  { id: 46, name: "Proposal generator", group: "Business & Conversion", description: "Auto-generates a signed proposal PDF from your brief.", icon: "FileSignature", status: "live" },
  { id: 47, name: "Collaboration portal", group: "Business & Conversion", description: "Client portal for active projects with milestones.", icon: "Users", status: "live" },
  { id: 48, name: "Project bidding", group: "Business & Conversion", description: "Open RFPs accept proposals with sealed-bid logic.", icon: "Gavel", status: "beta" },
  { id: 49, name: "Revenue simulation", group: "Business & Conversion", description: "Project the revenue impact of shipping with us.", icon: "TrendingUp", status: "live" },
  { id: 50, name: "Build with me CTA", group: "Business & Conversion", description: "Persistent CTA that adapts to where the visitor is in the funnel.", icon: "Hammer", status: "live" },
];

export const FEATURE_GROUPS = [
  "Identity & Story",
  "Trust & Credibility",
  "Portfolio Intelligence",
  "Experience & Engagement",
  "Business & Conversion",
] as const;