import type { PageBlock } from "../components/site/StandardPage";

export type SitePage = {
  eyebrow: string;
  title: string;
  intro: string;
  layout: "cards" | "list" | "faq";
  seoTitle: string;
  seoDescription: string;
  cta?: { label: string; to: string };
  blocks: PageBlock[];
};

export const PAGES: Record<string, SitePage> = {
  projects: {
    eyebrow: "Portfolio",
    title: "Projects",
    intro:
      "Production systems I designed, built and shipped, from internal platforms to public products. Search by name or technology.",
    layout: "cards",
    seoTitle: "Projects by EagerBeaver | Shipped Software Systems",
    seoDescription:
      "Production web and application projects built by EagerBeaver, senior software engineer: platforms, dashboards, logistics apps and design systems.",
    blocks: [
      {
        meta: "Data platform",
        title: "DataCore",
        body: "A real-time analytics platform that replaced a nightly spreadsheet process with live dashboards for operations teams.",
        tags: ["React", "TypeScript", "Postgres"],
        to: "/projects/datacore",
      },
      {
        meta: "Productivity",
        title: "Taskora",
        body: "A team workflow tool with milestone tracking, capacity planning and a shared client portal.",
        tags: ["React", "Supabase", "Tailwind"],
        to: "/projects/taskora",
      },
      {
        meta: "Sales enablement",
        title: "Deck",
        body: "An interactive pitch-deck engine that turns static slides into a shareable, analytics-aware experience.",
        tags: ["Motion", "Vite", "Edge"],
        to: "/projects/deck",
      },
      {
        meta: "Logistics",
        title: "CargoX Group",
        body: "A mobile-first logistics landing system with sixteen service variants and animated route maps.",
        tags: ["React", "Motion", "Mobile"],
        to: "/cargox",
      },
      {
        meta: "Education",
        title: "Limkokwing Connect",
        body: "A campus services portal covering enrolment, results and student support in one responsive interface.",
        tags: ["React", "Auth", "Postgres"],
        to: "/projects/limkokwing-connect",
      },
      {
        meta: "Design system",
        title: "Portfolio OS",
        body: "The operating system behind this site: content store, admin command center, media pipeline and security gate.",
        tags: ["TanStack", "Design system"],
        to: "/portfolio-os",
      },
    ],
  },

  "case-studies": {
    eyebrow: "Evidence",
    title: "Case Studies",
    intro:
      "Outcome-led write-ups: the problem, the constraint, the decision I made and the measurable result.",
    layout: "list",
    seoTitle: "Case Studies | Measurable Engineering Outcomes",
    seoDescription:
      "Detailed engineering case studies with problem framing, technical decisions and measurable business results.",
    blocks: [
      {
        meta: "Result: 94 percent faster reporting",
        title: "From nightly spreadsheets to live operations dashboards",
        body: "A distribution business ran on twelve linked spreadsheets. I modelled the domain in Postgres, streamed changes into a React dashboard and cut the reporting cycle from nine hours to under thirty minutes.",
        to: "/projects/datacore",
      },
      {
        meta: "Result: 38 percent more qualified leads",
        title: "A mobile-first logistics funnel that actually converts",
        body: "The old site was desktop-built and unusable on a phone. I rebuilt the funnel mobile-first with one clear action per screen, then split-tested sixteen service variants.",
        to: "/cargox",
      },
      {
        meta: "Result: onboarding cut from 3 weeks to 4 days",
        title: "A design system that let a small team ship like a big one",
        body: "Every screen was hand-rolled. I extracted tokens, built one component library and documented usage, so new features started from composition instead of from scratch.",
        to: "/portfolio-os",
      },
      {
        meta: "Result: zero unauthorised admin access",
        title: "Hardening an owner dashboard against real intrusion attempts",
        body: "Static credentials were the only barrier. I added role-based access, lockout after repeated failures, intruder capture, audit logging and retention rules.",
        to: "/investor/cybersecurity",
      },
    ],
  },

  services: {
    eyebrow: "Work with me",
    title: "Services",
    intro:
      "Focused engagements with clear deliverables, fixed pricing and a written scope before any code is written.",
    layout: "cards",
    seoTitle: "Software Engineering Services | Web Apps, Platforms, Systems",
    seoDescription:
      "Full-stack product engineering, web application development, design systems, security hardening and technical consulting.",
    blocks: [
      {
        meta: "From 2 weeks",
        title: "Product engineering",
        body: "End-to-end delivery of a web application: data model, backend, interface, deployment and handover documentation.",
        tags: ["React", "TypeScript", "Postgres"],
      },
      {
        meta: "From 1 week",
        title: "Design system build",
        body: "Tokens, components, documentation and a governance model so your team stops rebuilding the same button.",
        tags: ["Tailwind", "Storybook"],
      },
      {
        meta: "From 1 week",
        title: "Security hardening",
        body: "Authentication, role-based access, audit trails, rate limiting and a written threat model for your app.",
        tags: ["Auth", "RLS", "Audit"],
      },
      {
        meta: "From 3 days",
        title: "Performance rescue",
        body: "Core Web Vitals work: image pipeline, lazy loading, bundle surgery and measurable before-and-after numbers.",
        tags: ["Vitals", "Caching"],
      },
      {
        meta: "From 1 week",
        title: "Data and dashboards",
        body: "Turning operational chaos into a modelled database with dashboards the team actually opens every morning.",
        tags: ["SQL", "Analytics"],
      },
      {
        meta: "Retainer",
        title: "Fractional engineering lead",
        body: "Architecture review, code review, hiring support and roadmap ownership for teams without a senior engineer.",
        tags: ["Leadership"],
      },
    ],
  },

  marketplace: {
    eyebrow: "Products",
    title: "Digital Marketplace",
    intro:
      "Systems I have already built, packaged so you can ship faster. Each item includes source, documentation and a setup guide.",
    layout: "cards",
    seoTitle: "Digital Marketplace | Templates, Systems and Starter Kits",
    seoDescription:
      "Production-ready templates, dashboards and starter kits built by a senior software engineer, with source code and documentation.",
    cta: { label: "Request a product", to: "/contact" },
    blocks: [
      {
        meta: "Starter kit",
        title: "Portfolio OS starter",
        body: "The content store, admin command center and media pipeline that power this site, ready to rebrand.",
        tags: ["TanStack", "Supabase"],
        to: "/contact",
      },
      {
        meta: "Template pack",
        title: "Mobile-first landing system",
        body: "Sixteen conversion-tested landing variants inside a phone mockup shell, with motion built in.",
        tags: ["Motion", "Mobile"],
        to: "/cargox",
      },
      {
        meta: "Component library",
        title: "Dark dashboard kit",
        body: "Cards, tables, filters, modals and charts in a consistent dark theme with full keyboard support.",
        tags: ["Tailwind", "A11y"],
        to: "/contact",
      },
      {
        meta: "Toolkit",
        title: "Security gate module",
        body: "Lockout, intruder capture, audit logging and retention rules you can drop into an existing admin area.",
        tags: ["Security"],
        to: "/investor/cybersecurity",
      },
    ],
  },

  book: {
    eyebrow: "Consultation",
    title: "Book a Consultation",
    intro:
      "Pick the session that matches where you are. Every call ends with written notes and a recommended next step.",
    layout: "cards",
    seoTitle: "Book a Consultation | Technical Strategy Sessions",
    seoDescription:
      "Book a technical consultation: discovery call, architecture review, security audit or a full product roadmap session.",
    cta: { label: "Request a slot", to: "/contact" },
    blocks: [
      {
        meta: "30 minutes, free",
        title: "Discovery call",
        body: "You describe the problem, I tell you honestly whether I am the right person and roughly what it takes.",
        to: "/contact",
      },
      {
        meta: "60 minutes",
        title: "Architecture review",
        body: "Bring your repository or diagram. You leave with a prioritised list of the risks that matter.",
        to: "/contact",
      },
      {
        meta: "90 minutes",
        title: "Security audit session",
        body: "A walkthrough of authentication, access control, data exposure and logging, plus a written findings list.",
        to: "/contact",
      },
      {
        meta: "Half day",
        title: "Product roadmap workshop",
        body: "We turn a vague idea into a sequenced build plan with scope, milestones and a realistic budget.",
        to: "/contact",
      },
    ],
  },

  skills: {
    eyebrow: "Capability",
    title: "Skills and Technologies",
    intro:
      "The stack I use in production, grouped by where it sits in the system. Search for anything specific.",
    layout: "cards",
    seoTitle: "Skills and Technologies | Full-Stack Engineering Stack",
    seoDescription:
      "The production stack of a senior software engineer: React, TypeScript, Postgres, Supabase, Tailwind, edge deployment, security and testing.",
    blocks: [
      {
        meta: "Frontend",
        title: "Interface engineering",
        body: "React 19, TypeScript, TanStack Router and Query, Tailwind, Framer Motion, accessible component design.",
        tags: ["React", "TypeScript", "Tailwind"],
      },
      {
        meta: "Backend",
        title: "Server and data",
        body: "Postgres schema design, row-level security, server functions, REST and RPC design, background jobs.",
        tags: ["Postgres", "Node", "SQL"],
      },
      {
        meta: "Platform",
        title: "Infrastructure and delivery",
        body: "Edge deployment, Vercel and Cloudflare, Docker, CI pipelines, preview environments, observability.",
        tags: ["Edge", "Docker", "CI"],
      },
      {
        meta: "Security",
        title: "Application security",
        body: "Authentication flows, role-based access control, audit logging, rate limiting, threat modelling.",
        tags: ["Auth", "RBAC", "Audit"],
      },
      {
        meta: "Quality",
        title: "Testing and performance",
        body: "Type-level safety, unit and end-to-end tests, Core Web Vitals work, image and bundle optimisation.",
        tags: ["Vitest", "Playwright"],
      },
      {
        meta: "Craft",
        title: "Design and systems thinking",
        body: "Design tokens, component libraries, information architecture, motion design and documentation.",
        tags: ["Design systems"],
      },
    ],
  },

  blog: {
    eyebrow: "Writing",
    title: "Blog",
    intro: "Engineering notes from real builds: decisions, trade-offs and what I would do differently.",
    layout: "list",
    seoTitle: "Engineering Blog | Notes on Building Production Software",
    seoDescription:
      "Practical engineering essays on architecture, performance, security and shipping production software as a small team.",
    blocks: [
      {
        meta: "Architecture",
        title: "Why I model the database before I draw a screen",
        body: "Interfaces are cheap to change and data models are not. A walk through the questions I answer before writing any component.",
      },
      {
        meta: "Performance",
        title: "The image pipeline that fixed my largest contentful paint",
        body: "Preloading the hero, generating modern formats at build time and lazy loading everything else, with measured results.",
      },
      {
        meta: "Security",
        title: "Row-level security is a product decision, not a database detail",
        body: "How access rules shape features, and why writing policies first prevents whole categories of bugs.",
      },
      {
        meta: "Process",
        title: "Fixed price, written scope, no surprises",
        body: "The engagement structure that removed nearly all friction from my client work.",
      },
      {
        meta: "Craft",
        title: "Motion that means something",
        body: "Using animation to explain state changes instead of decorating them, and respecting reduced-motion preferences.",
      },
    ],
  },

  testimonials: {
    eyebrow: "Proof",
    title: "Testimonials",
    intro: "What clients and colleagues say after the work shipped.",
    layout: "cards",
    seoTitle: "Testimonials | Client Feedback and Reviews",
    seoDescription:
      "Verified client feedback on delivery quality, communication and results from software projects.",
    blocks: [
      {
        meta: "Operations director",
        title: "The reporting problem is simply gone",
        body: "We used to spend a full day assembling numbers. Now the dashboard is open before the first meeting and nobody argues about the figures.",
        tags: ["5.0"],
      },
      {
        meta: "Founder, logistics",
        title: "The first version already converted",
        body: "He asked better questions than our previous agency and the mobile funnel started producing enquiries in the first week.",
        tags: ["5.0"],
      },
      {
        meta: "Engineering manager",
        title: "Our juniors ship confidently now",
        body: "The design system and documentation changed how the team works. Onboarding went from weeks to days.",
        tags: ["5.0"],
      },
      {
        meta: "University lecturer",
        title: "Explains complexity without arrogance",
        body: "He can hold a room of students and a room of executives with the same clarity, which is rare.",
        tags: ["5.0"],
      },
    ],
  },

  "open-source": {
    eyebrow: "Public code",
    title: "Open Source",
    intro:
      "Libraries, utilities and reference implementations I maintain in public. Contributions welcome.",
    layout: "cards",
    seoTitle: "Open Source Projects and Contributions",
    seoDescription:
      "Open source libraries, utilities and reference implementations maintained by EagerBeaver.",
    blocks: [
      {
        meta: "Library",
        title: "reveal-motion",
        body: "A tiny scroll-reveal wrapper that respects reduced-motion preferences by default.",
        tags: ["TypeScript"],
        href: "https://github.com",
      },
      {
        meta: "Utility",
        title: "asset-pipe",
        body: "Build-time image variant generation with sensible defaults for modern formats.",
        tags: ["Vite"],
        href: "https://github.com",
      },
      {
        meta: "Reference",
        title: "rls-patterns",
        body: "A catalogue of row-level security policies for common multi-tenant shapes.",
        tags: ["Postgres"],
        href: "https://github.com",
      },
      {
        meta: "Starter",
        title: "tanstack-supabase-starter",
        body: "An opinionated starter wiring routing, server functions, auth and typed data access together.",
        tags: ["TanStack"],
        href: "https://github.com",
      },
    ],
  },

  certifications: {
    eyebrow: "Credentials",
    title: "Certifications",
    intro: "Formal training and verified credentials behind the practical work.",
    layout: "list",
    seoTitle: "Certifications and Professional Credentials",
    seoDescription:
      "Professional certifications in software engineering, cloud platforms, cybersecurity and network engineering.",
    blocks: [
      {
        meta: "Higher education",
        title: "Software Engineering, Limkokwing University",
        body: "Formal grounding in software architecture, algorithms, databases and systems analysis.",
      },
      {
        meta: "Cloud",
        title: "Cloud platform fundamentals",
        body: "Deployment models, managed services, identity and cost control across major cloud providers.",
      },
      {
        meta: "Security",
        title: "Application security practices",
        body: "Secure authentication, access control design, common vulnerability classes and mitigations.",
      },
      {
        meta: "Networking",
        title: "Network engineering foundations",
        body: "Routing, switching, addressing and troubleshooting for production environments.",
      },
      {
        meta: "Data",
        title: "Relational database design",
        body: "Normalisation, indexing, query performance and migration safety in Postgres.",
      },
    ],
  },

  resources: {
    eyebrow: "Free",
    title: "Resources",
    intro:
      "Documents and templates you can take and use today. No email wall on the downloads below.",
    layout: "cards",
    seoTitle: "Free Engineering Resources, Templates and Checklists",
    seoDescription:
      "Free downloadable engineering resources: project brief templates, launch checklists, security reviews and rate cards.",
    blocks: [
      {
        meta: "Download",
        title: "Curriculum vitae",
        body: "The full CV with experience, stack and selected projects, generated fresh every time.",
        to: "/cv",
      },
      {
        meta: "Template",
        title: "Project brief template",
        body: "The exact questions I ask before quoting, so you arrive at any developer already prepared.",
        to: "/contact",
      },
      {
        meta: "Checklist",
        title: "Pre-launch checklist",
        body: "Performance, accessibility, security, SEO and monitoring items to clear before going live.",
        to: "/skills",
      },
      {
        meta: "Guide",
        title: "Security review starter",
        body: "A short self-assessment covering authentication, access control, logging and data retention.",
        to: "/investor/cybersecurity",
      },
    ],
  },

  faqs: {
    eyebrow: "Answers",
    title: "Frequently Asked Questions",
    intro: "The questions clients ask most often, answered directly.",
    layout: "faq",
    seoTitle: "FAQs | Working With a Senior Software Engineer",
    seoDescription:
      "Answers about pricing, timelines, ownership, maintenance, technology choices and how projects are run.",
    blocks: [
      {
        title: "How do you price work?",
        body: "Fixed price against a written scope. You approve the scope and the number before any code is written, so there are no hourly surprises.",
      },
      {
        title: "How long does a project take?",
        body: "A focused web application is typically two to six weeks. Smaller pieces such as a performance rescue or a landing system take days.",
      },
      {
        title: "Who owns the code?",
        body: "You do, completely, including the repository and the deployment configuration, handed over with documentation.",
      },
      {
        title: "Do you offer maintenance?",
        body: "Yes, as a monthly retainer covering dependency updates, monitoring, small changes and priority response.",
      },
      {
        title: "Can you work with my existing team?",
        body: "Yes. I regularly work as an embedded senior engineer, doing code review and architecture alongside delivery.",
      },
      {
        title: "Which technologies do you use?",
        body: "React and TypeScript on the front end, Postgres on the data side, edge deployment for delivery. I choose boring, well-supported tools on purpose.",
      },
      {
        title: "How do we start?",
        body: "Send a brief through the contact page or book a free discovery call. You will get a reply with scope, timeline and price.",
      },
    ],
  },

  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "This is a plain-language summary of what this site collects, why, and how long it is kept.",
    layout: "list",
    seoTitle: "Privacy Policy | Data Collection and Retention",
    seoDescription:
      "How this site collects, uses, stores and deletes visitor and client data, including analytics and contact submissions.",
    cta: { label: "Ask a privacy question", to: "/contact" },
    blocks: [
      {
        title: "What is collected",
        body: "Anonymous visit data such as page, referrer, device type, browser, operating system and timezone. If you submit a form, the details you type in that form.",
      },
      {
        title: "Why it is collected",
        body: "Visit data shows which pages are useful and which devices to prioritise. Form data exists so I can reply to you.",
      },
      {
        title: "What is not collected",
        body: "No advertising trackers, no third-party profiling and no selling of data to anyone, ever.",
      },
      {
        title: "How long it is kept",
        body: "Contact submissions are kept while our conversation is active. Analytics records follow a retention rule that automatically deletes older entries.",
      },
      {
        title: "Security",
        body: "Data lives in a managed Postgres database with row-level access rules. Only the site owner, behind authentication and role checks, can read it.",
      },
      {
        title: "Your rights",
        body: "You can ask for a copy of your data or ask for it to be deleted at any time through the contact page, and it will be actioned promptly.",
      },
    ],
  },
};

export type ProjectDetail = {
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  outcome: string;
  stack: string[];
  role: string;
  timeline: string;
};

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  datacore: {
    name: "DataCore",
    tagline: "Live operational analytics for a distribution business.",
    problem:
      "Reporting ran on twelve linked spreadsheets. Numbers disagreed between departments and the daily cycle took roughly nine hours.",
    solution:
      "I modelled the domain properly in Postgres, built an ingestion layer with validation, then streamed changes into a React dashboard with role-scoped views.",
    outcome:
      "Reporting time dropped by about 94 percent, and disagreements about figures stopped because there is now one source of truth.",
    stack: ["React", "TypeScript", "Postgres", "Row-level security", "Edge deployment"],
    role: "Lead engineer, data model and interface",
    timeline: "6 weeks",
  },
  taskora: {
    name: "Taskora",
    tagline: "Workflow and capacity planning for small delivery teams.",
    problem:
      "Work lived in chat threads. Nobody could answer who was overloaded, what was late or what a client had already approved.",
    solution:
      "A milestone and task model with capacity planning, plus a read-only client portal so approvals happen in one place with a clear trail.",
    outcome:
      "Missed deadlines fell sharply and client status meetings became a two-minute link instead of a weekly call.",
    stack: ["React", "Supabase", "Tailwind", "TanStack Query"],
    role: "Product engineer",
    timeline: "5 weeks",
  },
  deck: {
    name: "Deck",
    tagline: "Interactive pitch decks with built-in analytics.",
    problem:
      "Static slide files were sent by email with no idea whether they were opened or where attention dropped.",
    solution:
      "A deck engine rendering slides as routes, with motion transitions, shareable links and per-slide engagement tracking.",
    outcome:
      "Follow-up calls became targeted because the team could see exactly which sections investors re-read.",
    stack: ["Vite", "Framer Motion", "Edge functions"],
    role: "Founding engineer",
    timeline: "3 weeks",
  },
  "limkokwing-connect": {
    name: "Limkokwing Connect",
    tagline: "A campus services portal for students and staff.",
    problem:
      "Enrolment, results and support requests were spread across notice boards, email and paper forms.",
    solution:
      "One responsive portal with authenticated student areas, staff tooling and a request pipeline with status tracking.",
    outcome:
      "Support requests became traceable and most routine student questions stopped reaching the front desk.",
    stack: ["React", "Postgres", "Authentication", "Responsive design"],
    role: "Senior engineer",
    timeline: "8 weeks",
  },
};
