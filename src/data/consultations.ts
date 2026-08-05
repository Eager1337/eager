export type ConsultationPackage = {
  slug: string;
  name: string;
  minutes: number;
  price: number;
  summary: string;
  includes: string[];
  best: string;
};

export const CONSULTATION_PACKAGES: ConsultationPackage[] = [
  {
    slug: "intro-call",
    name: "Intro call",
    minutes: 30,
    price: 0,
    summary: "A free scoping conversation to see whether the studio is the right fit for the build.",
    includes: ["Goal and constraint review", "Rough budget band", "Recommended next step", "Written recap by email"],
    best: "First contact",
  },
  {
    slug: "strategy-session",
    name: "Strategy session",
    minutes: 60,
    price: 180,
    summary: "A working session that turns a vague idea into a scoped, sequenced build plan.",
    includes: ["Architecture opinion", "Feature sequencing", "Cost and timeline model", "Recorded session plus notes"],
    best: "Pre-build planning",
  },
  {
    slug: "technical-audit",
    name: "Technical audit",
    minutes: 90,
    price: 340,
    summary: "A review of an existing product covering performance, security posture and code health.",
    includes: ["Performance and Core Web Vitals pass", "Security and access review", "Prioritised findings list", "Remediation roadmap PDF"],
    best: "Existing platforms",
  },
  {
    slug: "build-kickoff",
    name: "Build kickoff",
    minutes: 120,
    price: 520,
    summary: "The full kickoff workshop that produces the signed scope, milestones and delivery calendar.",
    includes: ["Stakeholder workshop", "Scope document", "Milestone calendar", "Proposal and contract ready to sign"],
    best: "Ready to start",
  },
];

/** Working hours in the studio time zone (Africa/Freetown, UTC+0). */
export const SLOT_HOURS_UTC = [9, 10, 11, 12, 14, 15, 16, 17, 18];

export const TIME_ZONES = [
  "Africa/Freetown",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Lisbon",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function findPackage(slug: string) {
  return CONSULTATION_PACKAGES.find((p) => p.slug === slug) ?? CONSULTATION_PACKAGES[0]!;
}
