export type Metric = { label: string; value: string; note: string };
export type Competitor = { name: string; positioning: string; speed: string; ownership: string; price: string; us: boolean };
export type Partnership = { name: string; kind: string; body: string };
export type PressAsset = { label: string; kind: string; url: string; note: string };

export const PRESS_SUMMARY = [
  "Eager Beaver is a one-operator product studio that ships investor-grade web platforms, internal operating systems and secure client portals in weeks instead of quarters.",
  "The studio combines full-stack engineering, security review and design into a single accountable delivery lane, which removes the agency coordination tax that normally consumes 30 to 40 percent of a project budget.",
  "Revenue comes from three lanes: fixed-scope build engagements, monthly operate-and-improve retainers, and a digital marketplace of production templates and internal tooling.",
];

export const PRESS_METRICS: Metric[] = [
  { label: "Projects delivered", value: "40+", note: "Client platforms, portals and marketing systems shipped end to end." },
  { label: "Median time to launch", value: "3.5 weeks", note: "From signed scope to a production deployment on a live domain." },
  { label: "Retainer retention", value: "92%", note: "Clients who continue past the first operate-and-improve cycle." },
  { label: "Client rating", value: "4.9 / 5", note: "Average post-delivery satisfaction score across engagements." },
  { label: "Lighthouse performance", value: "95+", note: "Typical production score on delivered marketing and portal builds." },
  { label: "Security findings closed", value: "100%", note: "Critical and high findings resolved before every handover." },
];

export const PRESS_COMPETITORS: Competitor[] = [
  { name: "Eager Beaver", positioning: "Solo studio with product ownership", speed: "3 to 5 weeks", ownership: "Full source, client owns everything", price: "Fixed scope, published bands", us: true },
  { name: "Traditional agency", positioning: "Layered account and delivery teams", speed: "3 to 6 months", ownership: "Often licensed, exit fees common", price: "Time and materials, high variance", us: false },
  { name: "Freelance marketplace", positioning: "Task level execution", speed: "Unpredictable", ownership: "Fragmented across contributors", price: "Lowest, highest rework risk", us: false },
  { name: "No-code template shop", positioning: "Prebuilt themes", speed: "Days", ownership: "Locked to the platform", price: "Cheap, ceiling reached quickly", us: false },
];

export const PRESS_PARTNERSHIPS: Partnership[] = [
  { name: "Lovable Cloud", kind: "Infrastructure", body: "Managed database, authentication, storage and server functions behind every delivered platform." },
  { name: "Vercel", kind: "Deployment", body: "Edge hosting and preview deployments for client review before any production release." },
  { name: "GitHub", kind: "Source control", body: "Every engagement ships to a client-owned repository with full commit history." },
  { name: "Cloudflare", kind: "Edge and security", body: "DNS, caching, bot mitigation and geo insight for production traffic." },
  { name: "Figma", kind: "Design", body: "Shared design files so stakeholders review the interface before build time is spent." },
  { name: "Supabase ecosystem", kind: "Data", body: "Row level security patterns and audit logging baked into the delivery template." },
];

export const PRESS_BOILERPLATE =
  "Eager Beaver is an independent product studio founded by Alusine G. Dumbuya. It designs, builds and operates secure web platforms, internal operating systems and client portals for growth-stage teams, delivering production software in weeks with full source ownership handed to the client.";

export const PRESS_FACTS: Metric[] = [
  { label: "Founded", value: "2021", note: "Independent studio, self funded to date." },
  { label: "Founder", value: "Alusine G. Dumbuya", note: "Full-stack engineer, systems builder and video editor." },
  { label: "Headquarters", value: "Freetown, Sierra Leone", note: "Serving clients remotely across Africa, Europe and North America." },
  { label: "Contact", value: "ebeaver091@gmail.com", note: "Press and partnership enquiries answered within one business day." },
];
