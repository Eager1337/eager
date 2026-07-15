import type { InvestorMetric, InvestorPillar } from "@/components/investor/InvestorPage";

export type InvestorPageData = {
  slug: "cybersecurity" | "ethical-hacking" | "network-engineering" | "it-services";
  eyebrow: string;
  title: string;
  lede: string;
  gradient: string;
  headline: string;
  metrics: InvestorMetric[];
  pillars: InvestorPillar[];
  services: string[];
  outcomes: { label: string; body: string }[];
  cta: { title: string; body: string };
};

export const investorPages: InvestorPageData[] = [
  {
    slug: "cybersecurity",
    eyebrow: "Practice — Cybersecurity",
    title: "Security engineered for growth-stage teams.",
    lede: "Threat modeling, cloud hardening, and incident response programs that satisfy auditors and unblock revenue.",
    gradient: "linear-gradient(135deg,#0b1120 0%,#1e293b 50%,#0f766e 100%)",
    headline: "Cybersecurity",
    metrics: [
      { label: "Avg breach reduction", value: "94%" },
      { label: "MTTR shift", value: "3.2h" },
      { label: "Frameworks", value: "SOC2 · ISO · HIPAA" },
      { label: "Deployments", value: "40+" },
    ],
    pillars: [
      { title: "Zero-trust architecture", body: "Identity-first network design with continuous verification, least-privilege enforcement, and workload attestation." },
      { title: "Cloud posture", body: "CSPM automation across AWS, GCP, and Azure with drift-detection, IAM guardrails, and encrypted data lanes." },
      { title: "SOC readiness", body: "Detection engineering, SIEM tuning, and 24/7 alert triage runbooks that turn signal into action." },
      { title: "Compliance", body: "SOC 2 Type II, ISO 27001, HIPAA, and PCI-DSS programs delivered with evidence pipelines and auditor briefings." },
      { title: "Application security", body: "Threat modeling, SAST/DAST, dependency governance, and secure-SDLC coaching baked into your CI/CD." },
      { title: "Incident response", body: "Tabletop drills, forensic playbooks, and on-call retainers with defined SLAs and legal coordination." },
    ],
    services: [
      "Threat modeling workshops",
      "Cloud security architecture reviews",
      "SIEM & SOAR deployment",
      "Penetration test remediation",
      "SOC 2 / ISO 27001 delivery",
      "Incident response retainers",
      "Security awareness training",
      "Board-level risk reporting",
    ],
    outcomes: [
      { label: "Enterprise deal unlocked", body: "SOC 2 Type II delivered in 92 days, unblocking a $3.4M enterprise contract stuck on procurement review." },
      { label: "Breach contained", body: "Ransomware intrusion contained in 41 minutes with zero data exfiltration and full forensic chain-of-custody." },
      { label: "Cost optimized", body: "Consolidated 11 overlapping security tools into 4, saving $180K annually while improving coverage." },
    ],
    cta: {
      title: "Ready to make security a growth lever?",
      body: "Book a discovery call to scope a 30-day threat model, remediation roadmap, and executive briefing.",
    },
  },
  {
    slug: "ethical-hacking",
    eyebrow: "Practice — Offensive Security",
    title: "Adversary simulation that finds what scanners miss.",
    lede: "Full-scope red-team engagements, application penetration testing, and continuous attack-surface reconnaissance.",
    gradient: "linear-gradient(135deg,#1a0b2e 0%,#4a044e 45%,#be123c 100%)",
    headline: "Ethical Hacking",
    metrics: [
      { label: "Critical findings per engagement", value: "12 avg" },
      { label: "Domain admin obtained", value: "2.4d" },
      { label: "Retest included", value: "Always" },
      { label: "Assessments shipped", value: "60+" },
    ],
    pillars: [
      { title: "External red team", body: "Objective-based simulations spanning phishing, physical, cloud, and lateral movement with a written narrative." },
      { title: "Web & API pentest", body: "Manual OWASP Top 10 plus business-logic abuse, auth bypass, and IDOR chains that automated tools skip." },
      { title: "Cloud attack paths", body: "AWS/GCP/Azure privilege escalation, misconfigured IAM, and container escape scenarios mapped to MITRE ATT&CK." },
      { title: "Mobile & IoT", body: "iOS, Android, and embedded firmware review with reverse engineering, cert pinning bypass, and hardware fuzzing." },
      { title: "Purple team", body: "Live collaboration with your blue team, tuning detections in real time and validating every alert." },
      { title: "Attack surface mgmt", body: "Continuous external reconnaissance, exposed-secret hunts, and shadow-IT discovery with monthly briefings." },
    ],
    services: [
      "Objective-based red team ops",
      "Web application pentesting",
      "API & GraphQL fuzzing",
      "Cloud configuration reviews",
      "Social engineering campaigns",
      "Mobile app pentesting",
      "Purple-team exercises",
      "Continuous attack surface monitoring",
    ],
    outcomes: [
      { label: "Critical CVE chain", body: "Chained three medium findings into full domain admin in 38 hours, before an in-progress acquisition due-diligence closed." },
      { label: "Insurance premium reduced", body: "Client cyber-insurance premium dropped 22% after passing our objective-based red-team with 0 critical unresolved." },
      { label: "Detection coverage doubled", body: "Purple-team engagement raised MITRE ATT&CK detection coverage from 34% to 78% in six weeks." },
    ],
    cta: {
      title: "Prove your defenses under real pressure.",
      body: "Scope a red-team engagement or continuous attack-surface program in a 30-minute discovery call.",
    },
  },
  {
    slug: "network-engineering",
    eyebrow: "Practice — Network Engineering",
    title: "Backbone-grade networks for teams that can't afford downtime.",
    lede: "SD-WAN, campus, data-center, and cloud interconnect designs with automation and observability from day one.",
    gradient: "linear-gradient(135deg,#020617 0%,#1e3a8a 50%,#0ea5e9 100%)",
    headline: "Network Engineering",
    metrics: [
      { label: "Uptime delivered", value: "99.99%" },
      { label: "Site rollouts", value: "120+" },
      { label: "Peak throughput", value: "400G" },
      { label: "Change failure rate", value: "1.2%" },
    ],
    pillars: [
      { title: "SD-WAN & SASE", body: "Cisco, Fortinet, and Palo Alto SD-WAN deployments with ZTNA overlays and unified policy management." },
      { title: "Data center fabrics", body: "VXLAN EVPN spine-leaf, 400G interconnects, and multi-vendor automation with Ansible and NetBox." },
      { title: "Wireless & campus", body: "High-density Wi-Fi 6E/7 deployments, campus segmentation, and NAC integration for zero-trust access." },
      { title: "Cloud interconnect", body: "Direct Connect, ExpressRoute, and Cloud Interconnect designs with resilient BGP and cost modeling." },
      { title: "Observability", body: "Streaming telemetry, flow analytics, and SLO dashboards that catch degradation before users notice." },
      { title: "Automation", body: "Terraform, Ansible, and NSO pipelines that turn network changes into code-reviewed, testable artifacts." },
    ],
    services: [
      "SD-WAN & SASE architecture",
      "Data-center fabric design",
      "Wireless site surveys",
      "BGP & routing optimization",
      "Firewall & segmentation reviews",
      "Cloud interconnect (AWS, Azure, GCP)",
      "Network automation pipelines",
      "24/7 NOC & operations",
    ],
    outcomes: [
      { label: "Zero-downtime migration", body: "Migrated 42 branch sites to SD-WAN across three weekends with zero user-impacting incidents." },
      { label: "Bandwidth cost cut", body: "Redesigned WAN topology saved $412K annually while doubling effective throughput to remote offices." },
      { label: "Recovery accelerated", body: "MTTR on network incidents dropped from 84 min to 9 min after rolling out streaming telemetry & auto-remediation." },
    ],
    cta: {
      title: "Build a network that stops being a bottleneck.",
      body: "Book a discovery call and receive a same-week architecture opinion on your top three network risks.",
    },
  },
  {
    slug: "it-services",
    eyebrow: "Practice — IT Services",
    title: "Managed IT that scales quietly in the background.",
    lede: "Endpoint, identity, help-desk, and vendor management delivered as an SLA-backed subscription your team can trust.",
    gradient: "linear-gradient(135deg,#0f172a 0%,#334155 50%,#f59e0b 100%)",
    headline: "IT Services",
    metrics: [
      { label: "Ticket SLA hit rate", value: "98.6%" },
      { label: "First-response time", value: "6 min" },
      { label: "Devices managed", value: "3,400+" },
      { label: "CSAT", value: "4.9 / 5" },
    ],
    pillars: [
      { title: "Endpoint management", body: "Intune, Jamf, and Kandji rollouts with zero-touch provisioning, patch policy, and encryption baselines." },
      { title: "Identity & SSO", body: "Okta, Entra ID, and Google Workspace consolidation with lifecycle automation and MFA enforcement." },
      { title: "Help desk", body: "Tiered support with SLAs, live chat, and a self-service knowledge base your team actually reads." },
      { title: "Backup & continuity", body: "3-2-1 backup strategy, DR runbooks, and quarterly restore tests so recovery is proven, not assumed." },
      { title: "Vendor management", body: "Consolidated SaaS renewals, license true-ups, and shadow-IT discovery with quarterly savings reviews." },
      { title: "Onboarding & offboarding", body: "Day-one ready laptops, provisioned accounts, and same-day off-boarding with revoked access audit trail." },
    ],
    services: [
      "24/7 help desk (US-based)",
      "MDM & endpoint hardening",
      "SSO & identity governance",
      "Backup & disaster recovery",
      "M365 / Google Workspace admin",
      "Vendor & license management",
      "Executive onboarding kits",
      "Quarterly business reviews",
    ],
    outcomes: [
      { label: "Onboarding accelerated", body: "New-hire time-to-productive cut from 5 days to 4 hours with zero-touch provisioning + preloaded stack." },
      { label: "License spend cut", body: "SaaS audit surfaced $118K of shelfware and duplicate seats across a 240-person org in the first quarter." },
      { label: "Downtime crushed", body: "P1 incidents down 71% year-over-year with proactive patching and endpoint health scoring." },
    ],
    cta: {
      title: "Give your team the IT experience they expect.",
      body: "Book a discovery call and receive a same-week gap analysis with a fixed-price transition proposal.",
    },
  },
];

export function findInvestorPage(slug: string) {
  return investorPages.find((p) => p.slug === slug);
}