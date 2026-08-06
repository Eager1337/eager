import { jsPDF } from "jspdf";
import type { Analytics } from "./portfolio-os-settings";
import { PROJECTS } from "../data/projects";
import portraitAsset from "../assets/portrait-red.jpg.asset.json";

const BRAND = "Alusine G. Dumbuya, Eager Beaver";
const BRAND_TAG = "Full-Stack Developer · Systems Builder · Video Editor";
const CONTACT = "ebeaver091@gmail.com · +232 33 695 803 · github.com/Eager1337";

let cachedPortrait: string | null = null;
async function loadPortrait(): Promise<string | null> {
  if (cachedPortrait) return cachedPortrait;
  try {
    const res = await fetch(portraitAsset.url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => { cachedPortrait = fr.result as string; resolve(cachedPortrait!); };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
}

function header(doc: jsPDF, title: string, portrait?: string | null) {
  doc.setFillColor(230, 57, 70);
  doc.rect(0, 0, 210, 22, "F");
  if (portrait) {
    try { doc.addImage(portrait, "JPEG", 175, 3, 16, 16); } catch { /* ignore */ }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(BRAND, 14, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(BRAND_TAG, 14, 16);
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 14, 34);
  doc.setDrawColor(230, 57, 70);
  doc.setLineWidth(0.6);
  doc.line(14, 37, 196, 37);
}

function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(CONTACT, 14, 288);
    doc.text(`Page ${i} of ${pages}`, 196, 288, { align: "right" });
  }
}

function saveAs(doc: jsPDF, name: string) {
  doc.save(name);
}

/* ============ CV ============ */
export async function downloadCvPdf() {
  const doc = new jsPDF();
  const portrait = await loadPortrait();
  header(doc, "Curriculum Vitae", portrait);
  let y = 46;
  if (portrait) {
    try { doc.addImage(portrait, "JPEG", 150, 42, 46, 56); } catch { /* ignore */ }
  }
  doc.setFontSize(10).setTextColor(60, 60, 60).setFont("helvetica", "normal");
  doc.text("Freetown, Sierra Leone · Limkokwing University", 14, y);
  y += 8;

  const sec = (title: string) => {
    y += 4;
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(230, 57, 70);
    doc.text(title.toUpperCase(), 14, y);
    y += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, 196, y);
    y += 5;
    doc.setTextColor(30, 30, 30).setFont("helvetica", "normal").setFontSize(10);
  };
  const line = (t: string) => {
    const wrapped = doc.splitTextToSize(t, 182);
    doc.text(wrapped, 14, y);
    y += wrapped.length * 5;
  };

  sec("Summary");
  line(
    "Full-stack developer and systems builder with a video-editing background. I ship end-to-end web products in React, TypeScript, TanStack Start, Node.js and Postgres, plus cinematic video in Premiere, After Effects and DaVinci Resolve. I build production-grade systems solo, from data model to deployment.",
  );

  sec("Core skills");
  ["HTML5, CSS3, JavaScript, TypeScript, React, Next.js, TanStack Start",
    "Node.js, PostgreSQL, Supabase, Cloudflare Workers, REST + server functions",
    "Tailwind CSS, Framer Motion, shadcn/ui, design systems, accessibility",
    "Premiere Pro, After Effects, DaVinci Resolve, motion typography, color",
    "Systems thinking, product ownership, CI/CD, testing, monitoring"]
    .forEach((t) => { line("• " + t); });

  sec("Selected projects");
  PROJECTS.slice(0, 8).forEach((p) => {
    doc.setFont("helvetica", "bold");
    line(`${p.title}, ${p.category}`);
    doc.setFont("helvetica", "normal");
    line(p.tagline);
    y += 1;
  });

  sec("Education");
  line("Limkokwing University, Sierra Leone, Software Engineering track (current).");

  sec("Contact");
  line("Email: ebeaver091@gmail.com");
  line("Phone: +232 33 695 803");
  line("GitHub: github.com/Eager1337");
  line("LinkedIn: linkedin.com/in/eager-beaver-03ab9040b");

  footer(doc);
  saveAs(doc, "Alusine-Dumbuya-CV.pdf");
}

/* ============ Rate card ============ */
export async function downloadRateCardPdf() {
  const doc = new jsPDF();
  const portrait = await loadPortrait();
  header(doc, "Rate Card & Packages", portrait);
  let y = 46;
  doc.setFontSize(10).setTextColor(60, 60, 60);
  doc.text("All prices in USD. Includes design, development, deploy and 30-day support.", 14, y);
  y += 10;

  const tiers = [
    { name: "Starter Site", price: "$1,200", weeks: "2 weeks",
      inc: ["Up to 5 pages", "Responsive design", "Contact form", "Basic SEO", "Deployed on Lovable Cloud"] },
    { name: "Growth Site", price: "$3,500", weeks: "4 weeks",
      inc: ["Up to 12 pages", "CMS or content model", "Auth + user accounts", "Analytics dashboard", "Custom animations"] },
    { name: "Signature Build", price: "from $8,000", weeks: "6–10 weeks",
      inc: ["Unlimited pages", "AI features", "Payments / subscriptions", "Multi-language", "Investor dashboard", "12-month roadmap"] },
  ];

  tiers.forEach((t) => {
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y, 182, 44, "F");
    doc.setTextColor(20, 20, 20).setFont("helvetica", "bold").setFontSize(14);
    doc.text(t.name, 20, y + 9);
    doc.setTextColor(230, 57, 70);
    doc.text(t.price, 196, y + 9, { align: "right" });
    doc.setTextColor(90, 90, 90).setFont("helvetica", "normal").setFontSize(9);
    doc.text(t.weeks, 20, y + 15);
    doc.setTextColor(30, 30, 30).setFontSize(9);
    t.inc.forEach((it, i) => { doc.text("• " + it, 20, y + 22 + i * 4); });
    y += 50;
  });

  y += 4;
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(230, 57, 70);
  doc.text("ADD-ONS", 14, y); y += 6;
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(30, 30, 30);
  [
    "Video editing (per finished minute), $180",
    "Extra page, $220",
    "Motion / animation pass, $650",
    "SEO audit + fixes, $450",
    "Ongoing retainer (monthly), from $900",
  ].forEach((s) => { doc.text("• " + s, 14, y); y += 6; });

  footer(doc);
  saveAs(doc, "Eager-Beaver-Rate-Card.pdf");
}

/* ============ Analytics ============ */
export function downloadAnalyticsCsv(a: Analytics, compare?: [string, string]) {
  const rows: string[] = [];
  rows.push("Metric,Value");
  rows.push(`Sessions,${a.sessions}`);
  rows.push(`First seen,${a.firstSeen ? new Date(a.firstSeen).toISOString() : ""}`);
  const totalViews = Object.values(a.projectViews).reduce((n, v) => n + v, 0);
  const totalClicks = Object.values(a.featureClicks).reduce((n, v) => n + v, 0);
  rows.push(`Total project views,${totalViews}`);
  rows.push(`Total feature clicks,${totalClicks}`);
  rows.push("");
  rows.push("Project,Views");
  Object.entries(a.projectViews).sort((x, y) => y[1] - x[1]).forEach(([k, v]) => rows.push(`${k},${v}`));
  rows.push("");
  rows.push("Feature,Clicks");
  Object.entries(a.featureClicks).sort((x, y) => y[1] - x[1]).forEach(([k, v]) => rows.push(`${k},${v}`));
  if (compare) {
    rows.push("");
    rows.push("Comparison,Metric,Value");
    compare.forEach((slug) => {
      const p = PROJECTS.find((x) => x.slug === slug);
      if (!p) return;
      rows.push(`${p.title},Category,${p.category}`);
      rows.push(`${p.title},Tagline,"${p.tagline.replace(/"/g, '""')}"`);
      p.metrics.forEach((m) => rows.push(`${p.title},${m.label},${m.value}`));
    });
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url; el.download = `portfolio-os-analytics-${Date.now()}.csv`; el.click();
  URL.revokeObjectURL(url);
}

export async function downloadAnalyticsPdf(a: Analytics, compare?: [string, string]) {
  const doc = new jsPDF();
  const portrait = await loadPortrait();
  header(doc, "Investor Analytics Pack", portrait);
  let y = 46;
  doc.setFontSize(10).setTextColor(60, 60, 60);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, y);
  y += 6;
  doc.setFontSize(9).setTextColor(90, 90, 90);
  doc.text(
    doc.splitTextToSize(
      "Investor-grade snapshot of Portfolio OS traffic, top-performing case studies, and a head-to-head comparison of the two projects the investor selected in the dashboard.",
      182,
    ),
    14,
    y,
  );
  y += 14;

  const totalViews = Object.values(a.projectViews).reduce((n, v) => n + v, 0);
  const totalClicks = Object.values(a.featureClicks).reduce((n, v) => n + v, 0);
  const kpis: [string, string][] = [
    ["Sessions", String(a.sessions)],
    ["Project views", String(totalViews)],
    ["Feature clicks", String(totalClicks)],
    ["First seen", a.firstSeen ? new Date(a.firstSeen).toLocaleDateString() : "-"],
  ];
  kpis.forEach(([k, v], i) => {
    const x = 14 + (i % 4) * 46;
    doc.setFillColor(245, 245, 245); doc.rect(x, y, 44, 22, "F");
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120, 120, 120);
    doc.text(k, x + 3, y + 6);
    doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(20, 20, 20);
    doc.text(v, x + 3, y + 16);
  });
  y += 32;

  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(230, 57, 70);
  doc.text("TOP CASE STUDIES", 14, y); y += 6;
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(30, 30, 30);
  const top = Object.entries(a.projectViews).sort((x, z) => z[1] - x[1]).slice(0, 12);
  if (top.length === 0) {
    doc.setTextColor(120, 120, 120);
    doc.text("No project views recorded yet.", 14, y);
    y += 8;
  } else {
    top.forEach(([slug, n]) => {
      const p = PROJECTS.find((x) => x.slug === slug);
      doc.text(`${(p?.title ?? slug).slice(0, 60)}`, 14, y);
      doc.text(String(n), 196, y, { align: "right" });
      y += 6;
    });
  }

  if (compare) {
    y += 6;
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(230, 57, 70);
    doc.text("COMPARISON SUMMARY", 14, y); y += 6;
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(30, 30, 30);
    const [a1, a2] = compare.map((s) => PROJECTS.find((p) => p.slug === s));
    if (a1 && a2) {
      doc.setFont("helvetica", "bold");
      doc.text(a1.title, 14, y); doc.text(a2.title, 110, y); y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize(a1.tagline, 90), 14, y);
      doc.text(doc.splitTextToSize(a2.tagline, 90), 110, y);
      y += 14;
      const rows = Math.max(a1.metrics.length, a2.metrics.length);
      for (let i = 0; i < rows; i++) {
        const m1 = a1.metrics[i], m2 = a2.metrics[i];
        if (m1) doc.text(`${m1.label}: ${m1.value}`, 14, y);
        if (m2) doc.text(`${m2.label}: ${m2.value}`, 110, y);
        y += 6;
      }
    }
  }

  // New page: full featured case-study one-liners
  doc.addPage();
  header(doc, "Featured Case Studies", portrait);
  let y2 = 46;
  doc.setFontSize(10).setTextColor(30, 30, 30);
  PROJECTS.slice(0, 12).forEach((p) => {
    if (y2 > 265) { doc.addPage(); header(doc, "Featured Case Studies (cont.)", portrait); y2 = 46; }
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text(`${p.title}`, 14, y2);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120, 120, 120);
    doc.text(p.category, 196, y2, { align: "right" });
    y2 += 5;
    doc.setTextColor(60, 60, 60).setFontSize(9);
    const t = doc.splitTextToSize(p.tagline, 182);
    doc.text(t, 14, y2); y2 += t.length * 4 + 2;
    const met = p.metrics.slice(0, 3).map((m) => `${m.value} ${m.label}`).join(" · ");
    if (met) { doc.setTextColor(230, 57, 70).setFontSize(9); doc.text(met, 14, y2); y2 += 6; }
    doc.setTextColor(30, 30, 30);
    y2 += 3;
  });

  footer(doc);
  saveAs(doc, `investor-analytics-${Date.now()}.pdf`);
}

/* ============ Quote proposal ============ */
export interface QuoteInput {
  client: string;
  pages: number;
  complexity: string;
  timelineTier: string;
  weeks: number;
  addons: string[];
  subtotal: number;
  addonsTotal: number;
  total: number;
}

export function downloadQuotePdf(q: QuoteInput) {
  const doc = new jsPDF();
  header(doc, "Project Proposal");
  let y = 46;
  doc.setFontSize(10).setTextColor(60, 60, 60);
  doc.text(`Prepared for: ${q.client || "Client"}`, 14, y); y += 5;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y); y += 10;

  const sec = (title: string) => {
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(230, 57, 70);
    doc.text(title.toUpperCase(), 14, y); y += 6;
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(30, 30, 30);
  };
  const li = (t: string) => { const w = doc.splitTextToSize("• " + t, 182); doc.text(w, 14, y); y += w.length * 5; };

  sec("Scope");
  li(`${q.pages} pages`);
  li(`${q.complexity[0].toUpperCase() + q.complexity.slice(1)} complexity`);
  q.addons.forEach(li);

  y += 3;
  sec("Timeline");
  li(`${q.weeks} weeks (${q.timelineTier})`);

  y += 3;
  sec("Investment");
  doc.text(`Subtotal:`, 14, y); doc.text(`$${q.subtotal.toLocaleString()}`, 196, y, { align: "right" }); y += 6;
  doc.text(`Add-ons:`, 14, y); doc.text(`$${q.addonsTotal.toLocaleString()}`, 196, y, { align: "right" }); y += 6;
  doc.setFont("helvetica", "bold").setFontSize(13);
  doc.text(`Total:`, 14, y); doc.text(`$${q.total.toLocaleString()}`, 196, y, { align: "right" });
  y += 10;

  doc.setFont("helvetica", "normal").setFontSize(10);
  sec("Deliverables");
  li("Production build shipped on Lovable Cloud");
  li("Full source access, you own the code");
  li("30-day post-launch support included");
  li("Signable SOW within 24 hours of acceptance");

  footer(doc);
  saveAs(doc, `proposal-${(q.client || "client").replace(/\W+/g, "-")}-${Date.now()}.pdf`);
}
/* ============ Investor pitch deck ============ */

/* ============ Branded proposal + signable contract ============ */
export interface ProposalInput {
  client_name: string;
  client_email: string;
  title: string;
  summary: string;
  scope: string[];
  deliverables: string;
  timeline: string;
  price: number;
  currency: string;
  valid_until?: string | null;
  notes?: string;
}

export async function downloadProposalPdf(p: ProposalInput) {
  const doc = new jsPDF();
  header(doc, p.title || "Project Proposal", await loadPortrait());
  let y = 46;
  const money = `${p.currency || "USD"} ${Number(p.price || 0).toLocaleString()}`;

  doc.setFontSize(10).setTextColor(60, 60, 60);
  doc.text(`Prepared for: ${p.client_name || "Client"}`, 14, y);
  y += 5;
  if (p.client_email) { doc.text(p.client_email, 14, y); y += 5; }
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
  y += 5;
  if (p.valid_until) { doc.text(`Valid until: ${p.valid_until}`, 14, y); y += 5; }
  y += 5;

  const sec = (title: string) => {
    if (y > 250) { doc.addPage(); y = 24; }
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(230, 57, 70);
    doc.text(title.toUpperCase(), 14, y);
    y += 6;
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(30, 30, 30);
  };
  const para = (t: string) => {
    if (!t) return;
    const w = doc.splitTextToSize(t, 182);
    if (y + w.length * 5 > 275) { doc.addPage(); y = 24; }
    doc.text(w, 14, y);
    y += w.length * 5 + 3;
  };
  const li = (t: string) => para("\u2022 " + t);

  if (p.summary) { sec("Executive summary"); para(p.summary); }
  if (p.scope.length) { sec("Scope of work"); p.scope.forEach(li); }
  if (p.deliverables) { sec("Deliverables"); p.deliverables.split("\n").filter(Boolean).forEach(li); }
  if (p.timeline) { sec("Timeline"); para(p.timeline); }

  sec("Investment");
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text(money, 14, y);
  y += 10;
  doc.setFont("helvetica", "normal").setFontSize(10);

  if (p.notes) { sec("Notes"); para(p.notes); }

  sec("Acceptance");
  para("Signing below authorises the scope, timeline and investment above.");
  doc.setDrawColor(150, 150, 150);
  doc.line(14, y + 12, 90, y + 12);
  doc.line(110, y + 12, 196, y + 12);
  doc.setFontSize(8).setTextColor(120, 120, 120);
  doc.text("Client signature", 14, y + 17);
  doc.text("Date", 110, y + 17);

  footer(doc);
  saveAs(doc, `proposal-${(p.client_name || "client").replace(/\W+/g, "-")}-${Date.now()}.pdf`);
}

export interface ContractInput {
  title: string;
  client_name: string;
  value: number;
  starts_on?: string | null;
  ends_on?: string | null;
  terms: string;
  signer_name?: string;
  signer_email?: string;
  signature_data?: string;
  signed_at?: string | null;
}

export async function downloadContractPdf(c: ContractInput) {
  const doc = new jsPDF();
  header(doc, c.title || "Service agreement", await loadPortrait());
  let y = 46;
  doc.setFontSize(10).setTextColor(60, 60, 60);
  doc.text(`Client: ${c.client_name || "Client"}`, 14, y);
  y += 5;
  doc.text(`Contract value: $${Number(c.value || 0).toLocaleString()}`, 14, y);
  y += 5;
  doc.text(`Term: ${c.starts_on || "TBD"} to ${c.ends_on || "TBD"}`, 14, y);
  y += 10;

  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(230, 57, 70);
  doc.text("TERMS", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(30, 30, 30);
  const terms = doc.splitTextToSize(c.terms || "Terms to be agreed.", 182);
  terms.forEach((line: string) => {
    if (y > 255) { doc.addPage(); y = 24; }
    doc.text(line, 14, y);
    y += 5;
  });
  y += 8;

  if (y > 220) { doc.addPage(); y = 30; }
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(230, 57, 70);
  doc.text("SIGNATURE", 14, y);
  y += 8;
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(30, 30, 30);
  if (c.signature_data) {
    try { doc.addImage(c.signature_data, "PNG", 14, y, 70, 26); } catch { /* ignore */ }
  }
  doc.setDrawColor(150, 150, 150);
  doc.line(14, y + 28, 90, y + 28);
  doc.setFontSize(9);
  doc.text(c.signer_name || "Unsigned", 14, y + 34);
  if (c.signer_email) doc.text(c.signer_email, 14, y + 39);
  if (c.signed_at) doc.text(`Signed ${new Date(c.signed_at).toLocaleString()}`, 110, y + 34);

  footer(doc);
  saveAs(doc, `contract-${(c.client_name || "client").replace(/\W+/g, "-")}-${Date.now()}.pdf`);
}

import {
  PRESS_SUMMARY,
  PRESS_METRICS,
  PRESS_COMPETITORS,
  PRESS_PARTNERSHIPS,
  PRESS_BOILERPLATE,
  PRESS_FACTS,
} from "../data/press-kit";

export async function downloadPitchDeckPdf() {
  const doc = new jsPDF({ orientation: "landscape", format: "a4" });
  const W = 297;
  const H = 210;

  const slide = (kicker: string, title: string) => {
    doc.setFillColor(10, 10, 12);
    doc.rect(0, 0, W, H, "F");
    doc.setFillColor(230, 57, 70);
    doc.rect(0, 0, W, 4, "F");
    doc.setTextColor(230, 57, 70).setFont("helvetica", "bold").setFontSize(9);
    doc.text(kicker.toUpperCase(), 18, 24);
    doc.setTextColor(255, 255, 255).setFontSize(26);
    doc.text(title, 18, 40);
    doc.setFont("helvetica", "normal");
  };
  const body = (lines: string[], startY = 58, size = 12) => {
    doc.setFontSize(size).setTextColor(225, 225, 230);
    let y = startY;
    lines.forEach((l) => {
      const w = doc.splitTextToSize(l, W - 36);
      doc.text(w, 18, y);
      y += w.length * (size * 0.52) + 5;
    });
    return y;
  };

  // Cover
  slide("Investor pitch deck", BRAND);
  body([BRAND_TAG, PRESS_BOILERPLATE], 60, 13);
  doc.setFontSize(10).setTextColor(150, 150, 155);
  doc.text(CONTACT, 18, H - 16);

  // Executive summary
  doc.addPage();
  slide("Executive summary", "One operator, product-grade delivery");
  body(PRESS_SUMMARY.map((s) => "• " + s));

  // Metrics
  doc.addPage();
  slide("Key metrics", "Traction to date");
  PRESS_METRICS.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 18 + col * 90;
    const y = 62 + row * 52;
    doc.setDrawColor(60, 60, 66).roundedRect(x, y - 12, 82, 40, 3, 3);
    doc.setTextColor(230, 57, 70).setFont("helvetica", "bold").setFontSize(20);
    doc.text(m.value, x + 6, y);
    doc.setTextColor(255, 255, 255).setFontSize(9);
    doc.text(m.label.toUpperCase(), x + 6, y + 7);
    doc.setFont("helvetica", "normal").setTextColor(180, 180, 186).setFontSize(8);
    doc.text(doc.splitTextToSize(m.note, 72), x + 6, y + 14);
  });

  // Competitors
  doc.addPage();
  slide("Competitive landscape", "Why clients pick the studio");
  let cy = 58;
  doc.setFontSize(9).setTextColor(150, 150, 155);
  ["Option", "Positioning", "Speed", "Ownership", "Pricing"].forEach((h, i) =>
    doc.text(h.toUpperCase(), 18 + i * 55, cy),
  );
  cy += 6;
  PRESS_COMPETITORS.forEach((c) => {
    doc.setFont("helvetica", c.us ? "bold" : "normal");
    if (c.us) doc.setTextColor(230, 57, 70);
    else doc.setTextColor(225, 225, 230);
    doc.setFontSize(9);
    [c.name, c.positioning, c.speed, c.ownership, c.price].forEach((v, i) => {
      doc.text(doc.splitTextToSize(v, 52), 18 + i * 55, cy);
    });
    cy += 20;
  });

  // Partnerships
  doc.addPage();
  slide("Partnerships", "The delivery stack");
  body(PRESS_PARTNERSHIPS.map((p) => `• ${p.name} (${p.kind}): ${p.body}`), 58, 11);

  // Selected work
  doc.addPage();
  slide("Selected work", "Shipped platforms");
  body(
    PROJECTS.slice(0, 6).map((p) => `• ${p.title}: ${p.tagline}`),
    58,
    11,
  );

  // Facts and contact
  doc.addPage();
  slide("Fact sheet", "Studio at a glance");
  body(PRESS_FACTS.map((f) => `• ${f.label}: ${f.value} — ${f.note}`.replace(" — ", ". ")), 58, 12);
  doc.setFontSize(11).setTextColor(230, 57, 70);
  doc.text(CONTACT, 18, H - 20);

  saveAs(doc, `eager-beaver-pitch-deck-${Date.now()}.pdf`);
}
