import { SmartImage } from "../lib/assets";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Code2,
  Video,
  Server,
  Layers,
  Search,
  PenTool,
  Hammer,
  TestTube2,
  Rocket,
  LifeBuoy,
  FileText,
  Check,
} from "lucide-react";
import { downloadCvPdf, downloadRateCardPdf } from "../lib/pdf-exports";
import portraitRed from "../assets/portrait-red.jpg.asset.json";
import portraitBlackSit from "../assets/portrait-black-sitting.jpg.asset.json";
import portraitBlackStand from "../assets/portrait-black-standing.jpg.asset.json";
import { useContent } from "../lib/content-store";

const PORTRAITS = [portraitRed, portraitBlackStand, portraitBlackSit];

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Alusine G. Dumbuya, Eager Beaver · Full-Stack Developer & Video Editor" },
      {
        name: "description",
        content:
          "Portfolio of Alusine G. Dumbuya (Eager Beaver), full-stack developer, systems builder and video editor studying at Limkokwing University, Sierra Leone.",
      },
      { property: "og:title", content: "Alusine G. Dumbuya, Eager Beaver" },
      {
        property: "og:description",
        content: "Full-stack developer, systems builder and video editor. Sierra Leone.",
      },
      { property: "og:image", content: portraitRed.url },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: portraitRed.url },
    ],
  }),
  component: PortfolioPage,
});

const EMAIL = "ebeaver091@gmail.com";
const PHONE = "+232 33 695 803";
const GITHUB = "https://github.com/Eager1337?tab=repositories";
const LINKEDIN = "https://www.linkedin.com/in/eager-beaver-03ab9040b";

const SERVICES = [
  {
    icon: Code2,
    title: "Web & App Development",
    body: "Production-ready websites and mobile-first web apps in React, TypeScript and modern tooling.",
  },
  {
    icon: Server,
    title: "Backend & APIs",
    body: "Type-safe REST and server functions, auth, databases and integrations that scale.",
  },
  {
    icon: Layers,
    title: "Systems Building",
    body: "Architecting end-to-end systems, from data model to deployment, that ship and stay shipped.",
  },
  {
    icon: Video,
    title: "Video Editing",
    body: "Story-driven edits, motion typography and color, for brands, creators and short-form social.",
  },
];

const STACK = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "React",
  "TypeScript",
  "Next.js",
  "TanStack",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  "Tailwind CSS",
  "Framer Motion",
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
];

const PROCESS = [
  {
    icon: Search,
    k: "01",
    t: "Discovery & Brief",
    d: "I sit with the problem before I touch a file. Goals, users, constraints, budget, deadline, success metric, all written down and confirmed with you before scope is locked.",
  },
  {
    icon: PenTool,
    k: "02",
    t: "Architecture & Design",
    d: "Wireframes, data model, API contracts and a component inventory. You approve the flow and the visual direction before a single production line is written.",
  },
  {
    icon: Hammer,
    k: "03",
    t: "Build in Vertical Slices",
    d: "I ship one working slice at a time, frontend, backend, database, deployed, so you can click a real thing every few days instead of waiting for a big reveal.",
  },
  {
    icon: TestTube2,
    k: "04",
    t: "Test, Review, Harden",
    d: "Type-safe code, real device testing, accessibility pass, Lighthouse, and a security review before anything is called done. Bugs get fixed at the root, not patched.",
  },
  {
    icon: Rocket,
    k: "05",
    t: "Launch & Handoff",
    d: "CI/CD pipeline, environment variables documented, a written runbook and a walkthrough call. You own the codebase, no lock-in, no black boxes.",
  },
  {
    icon: LifeBuoy,
    k: "06",
    t: "Iterate & Support",
    d: "30-day post-launch window included. After that we can move to a retainer for features, monitoring and monthly reports, or you're free to fly solo.",
  },
];

function PortfolioPage() {
  const [pIdx, setPIdx] = useState(0);
  const { pricing } = useContent();
  const nextP = () => setPIdx((i) => (i + 1) % PORTRAITS.length);
  const prevP = () => setPIdx((i) => (i - 1 + PORTRAITS.length) % PORTRAITS.length);
  const current = PORTRAITS[pIdx];

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F1FAEE] font-[Inter,sans-serif] antialiased selection:bg-[#E63946] selection:text-white">
      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0C0C0C]/70 border-b border-white/5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 py-4">
          <Link to="/portfolio" className="font-[Anton,sans-serif] text-xl tracking-wider">
            EAGER<span className="text-[#E63946]">.</span>BEAVER
          </Link>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <a href="#work" className="text-[#A8A8A8] hover:text-white transition-colors">
              Work
            </a>
            <a
              href="#services"
              className="text-[#A8A8A8] hover:text-white transition-colors hidden sm:inline"
            >
              Services
            </a>
            <a
              href="#process"
              className="text-[#A8A8A8] hover:text-white transition-colors hidden sm:inline"
            >
              Process
            </a>
            <a href="#contact" className="text-[#A8A8A8] hover:text-white transition-colors">
              Contact
            </a>
            <Link
              to="/"
              className="rounded-full border border-white/20 px-3 py-1.5 hover:border-white hover:bg-white hover:text-black transition-colors"
            >
              Explore site
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#E63946] mb-6">
              Portfolio · Sierra Leone
            </p>
            <h1 className="font-[Anton,sans-serif] uppercase leading-[0.85] tracking-tight text-[clamp(3rem,9vw,8rem)]">
              Alusine G.
              <br />
              <span className="text-[#E63946]">Dumbuya</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-[#A8A8A8] leading-relaxed">
              Also known as <span className="text-white font-semibold">Eager Beaver</span>, a
              full-stack developer, systems builder and video editor studying at{" "}
              <span className="text-white">Limkokwing University, Sierra Leone</span>. I build
              websites, apps and backends end-to-end, and I cut video that earns attention.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#E63946] px-5 py-3 text-sm font-semibold text-white hover:bg-white hover:text-[#0C0C0C] transition-colors"
              >
                Hire me <ArrowUpRight className="w-4 h-4" />
              </a>
              <button
                onClick={downloadCvPdf}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold hover:border-white hover:bg-white hover:text-[#0C0C0C] transition-colors"
              >
                <FileText className="w-4 h-4" /> Download CV
              </button>
              <button
                onClick={downloadRateCardPdf}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold hover:border-white hover:bg-white hover:text-[#0C0C0C] transition-colors"
              >
                <FileText className="w-4 h-4" /> Rate card
              </button>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold hover:border-white hover:bg-white hover:text-[#0C0C0C] transition-colors"
              >
                <Github className="w-4 h-4" /> See my code
              </a>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold hover:border-white hover:bg-white hover:text-[#0C0C0C] transition-colors"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
              {[
                { k: "4+", v: "Disciplines" },
                { k: "100%", v: "Self-shipped" },
                { k: "24/7", v: "Eager" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-[Anton,sans-serif] text-3xl sm:text-5xl text-white">{s.k}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-widest text-[#A8A8A8]">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative">
              <div
                className="absolute -inset-4 bg-[#E63946]/30 blur-3xl rounded-full"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1A1410]">
                <SmartImage
                  key={current.url}
                  src={current.url}
                  alt="Alusine G. Dumbuya, Eager Beaver"
                  className="w-full h-auto block animate-in fade-in duration-500"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <button
                    onClick={prevP}
                    aria-label="Previous portrait"
                    className="rounded-full bg-black/50 hover:bg-[#E63946] text-white p-2.5 backdrop-blur transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1.5">
                    {PORTRAITS.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${i === pIdx ? "w-6 bg-[#E63946]" : "w-1.5 bg-white/40"}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextP}
                    aria-label="Next portrait"
                    className="rounded-full bg-black/50 hover:bg-[#E63946] text-white p-2.5 backdrop-blur transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#A8A8A8]">
                      Currently
                    </p>
                    <p className="font-[Anton,sans-serif] text-xl text-white">Available for work</p>
                  </div>
                  <span className="flex h-3 w-3 rounded-full bg-[#E63946] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="px-5 sm:px-8 py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-8 mb-12 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#E63946]">How I work</p>
              <h2 className="mt-3 font-[Anton,sans-serif] uppercase text-4xl sm:text-6xl leading-none">
                Six steps. Zero
                <br />
                <span className="text-[#E63946]">surprises.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#A8A8A8] leading-relaxed">
              Every project I take on runs through the same disciplined pipeline, so you always
              know what's happening, what's next, and what "done" looks like. No vibes, no vanishing
              acts.
            </p>
          </div>

          <ol className="relative border-l border-white/10 ml-3 sm:ml-6">
            {PROCESS.map(({ icon: Icon, k, t, d }, i) => (
              <li key={k} className="pl-8 sm:pl-12 pb-10 last:pb-0 relative">
                <span className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#E63946] text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#1A1410]">
                    <Icon className="w-6 h-6 text-[#E63946]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-[Anton,sans-serif] text-3xl sm:text-4xl text-white/30">
                        {k}
                      </span>
                      <h3 className="font-[Anton,sans-serif] uppercase text-xl sm:text-2xl tracking-wide">
                        {t}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-[#A8A8A8] leading-relaxed max-w-2xl">{d}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
            {[
              { k: "Fixed", v: "Scope + price agreed upfront" },
              { k: "Weekly", v: "Demo call every Friday" },
              { k: "Owned", v: "You keep the code, always" },
              { k: "30 days", v: "Free post-launch support" },
            ].map((s) => (
              <div key={s.k} className="bg-[#0C0C0C] p-5 sm:p-6">
                <p className="font-[Anton,sans-serif] uppercase text-2xl text-white">{s.k}</p>
                <p className="mt-1 text-xs text-[#A8A8A8]">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="px-5 sm:px-8 py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-8 mb-12">
            <h2 className="font-[Anton,sans-serif] uppercase text-4xl sm:text-6xl leading-none">
              What I<br />
              <span className="text-[#E63946]">do.</span>
            </h2>
            <p className="hidden sm:block max-w-sm text-sm text-[#A8A8A8]">
              One brain, four crafts. Brief me on the outcome, I'll handle the stack.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
            {SERVICES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-[#0C0C0C] p-6 sm:p-8 group hover:bg-[#1A1410] transition-colors"
              >
                <Icon className="w-8 h-8 text-[#E63946] mb-6" />
                <h3 className="font-[Anton,sans-serif] uppercase text-2xl tracking-wide">
                  {title}
                </h3>
                <p className="mt-3 text-sm text-[#A8A8A8] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section id="work" className="px-5 sm:px-8 py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#E63946]">Featured work</p>
          <h2 className="mt-3 font-[Anton,sans-serif] uppercase text-4xl sm:text-6xl leading-none">
            Hero showcases.
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                to: "/work/aurai",
                title: "Aurai",
                tag: "Ambient AI",
                grad: "from-fuchsia-500/30 to-cyan-500/20",
              },
              {
                to: "/work/aeon",
                title: "Aeon",
                tag: "Cinematic launch",
                grad: "from-indigo-500/30 to-sky-500/10",
              },
              {
                to: "/halo",
                title: "USD Halo",
                tag: "Premium fintech",
                grad: "from-sky-400/30 to-indigo-500/10",
              },
              {
                to: "/work/ios",
                title: "iOS trio",
                tag: "Mobile templates",
                grad: "from-emerald-500/30 to-teal-500/10",
              },
              {
                to: "/work/datacore",
                title: "Datacore",
                tag: "Linear-style",
                grad: "from-violet-500/30 to-orange-500/10",
              },
              {
                to: "/work/taskora",
                title: "Taskora",
                tag: "SaaS dashboard",
                grad: "from-white/15 to-white/0",
              },
              {
                to: "/work/deck",
                title: "Mux deck",
                tag: "HLS slide deck",
                grad: "from-rose-500/30 to-amber-500/10",
              },
            ].map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${p.grad} p-6 h-56 flex flex-col justify-between hover:border-white/30 transition-colors`}
              >
                <span className="text-xs uppercase tracking-[0.25em] text-white/70">{p.tag}</span>
                <div className="flex items-end justify-between">
                  <h3 className="font-[Anton,sans-serif] uppercase text-3xl tracking-wide">
                    {p.title}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-white/70 group-hover:text-white transition" />
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-16 text-xs uppercase tracking-[0.3em] text-[#E63946]">Toolbox</p>
          <h2 className="mt-3 font-[Anton,sans-serif] uppercase text-4xl sm:text-6xl leading-none">
            The stack I ship with.
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {STACK.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-[#F1FAEE] hover:border-[#E63946] hover:text-white transition-colors"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 p-6 sm:p-10 bg-gradient-to-br from-[#1A1410] to-[#0C0C0C]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h3 className="font-[Anton,sans-serif] uppercase text-2xl sm:text-4xl">
                  Live projects on GitHub
                </h3>
                <p className="mt-2 text-sm text-[#A8A8A8] max-w-md">
                  Browse every repository I've shipped, open source, experiments and client work.
                </p>
              </div>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0C0C0C] hover:bg-[#E63946] hover:text-white transition-colors w-fit"
              >
                <Github className="w-4 h-4" /> @Eager1337 <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-5 sm:px-8 py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#E63946]">Investment</p>
          <h2 className="mt-3 font-[Anton,sans-serif] uppercase text-4xl sm:text-6xl leading-none">
            Pricing, upfront.
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-[#A8A8A8]">
            Fixed-scope packages. No hourly billing games. Everything includes design, development,
            deployment on Lovable Cloud and 30-day post-launch support.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {pricing.map((t) => (
              <div
                key={t.name}
                className={`rounded-2xl border p-6 sm:p-7 ${t.best ? "border-[#E63946] bg-[#1A1410]" : "border-white/10 bg-[#0C0C0C]"}`}
              >
                {t.best && (
                  <div className="mb-3 inline-block rounded-full bg-[#E63946] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                    Most popular
                  </div>
                )}
                <h3 className="font-[Anton,sans-serif] uppercase text-2xl">{t.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-[Anton,sans-serif] text-4xl text-white">{t.price}</span>
                  <span className="text-xs text-[#A8A8A8]">· {t.weeks}</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-[#F1FAEE]">
                  {t.inc.map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(t.name + " enquiry")}`}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${t.best ? "bg-[#E63946] text-white hover:bg-white hover:text-[#0C0C0C]" : "border border-white/20 hover:border-white hover:bg-white hover:text-[#0C0C0C]"}`}
                >
                  Start this package <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={downloadRateCardPdf}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0C0C0C] hover:bg-[#E63946] hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4" /> Download full rate card
            </button>
            <button
              onClick={downloadCvPdf}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold hover:border-white hover:bg-white hover:text-[#0C0C0C] transition-colors"
            >
              <FileText className="w-4 h-4" /> Download CV (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-5 sm:px-8 py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.3em] text-[#E63946]">Let's build</p>
            <h2 className="mt-3 font-[Anton,sans-serif] uppercase text-5xl sm:text-7xl leading-[0.9]">
              Got a good
              <br />
              opportunity?
            </h2>
            <p className="mt-6 max-w-lg text-[#A8A8A8]">
              Internships, freelance gigs, full-time roles or a project you need shipped fast, I'd
              love to hear about it.
            </p>
          </div>
          <div className="lg:col-span-5 space-y-3">
            <ContactRow icon={Mail} label="Email" value={EMAIL} href={`mailto:${EMAIL}`} />
            <ContactRow icon={Phone} label="Phone" value={PHONE} href={`tel:+23233695803`} />
            <ContactRow
              icon={Linkedin}
              label="LinkedIn"
              value="eager-beaver"
              href={LINKEDIN}
              external
            />
            <ContactRow icon={Github} label="GitHub" value="@Eager1337" href={GITHUB} external />
            <ContactRow icon={MapPin} label="Based in" value="Freetown, Sierra Leone" />
          </div>
        </div>
      </section>

      <footer className="px-5 sm:px-8 py-10 border-t border-white/5 text-xs text-[#A8A8A8] flex flex-wrap items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} Alusine G. Dumbuya, Eager Beaver.</span>
        <span>Built & shipped from Sierra Leone.</span>
      </footer>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0C0C0C] hover:border-[#E63946] hover:bg-[#1A1410] px-5 py-4 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <Icon className="w-5 h-5 text-[#E63946] shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#A8A8A8]">{label}</p>
          <p className="text-sm text-white truncate">{value}</p>
        </div>
      </div>
      {href && (
        <ArrowUpRight className="w-4 h-4 text-[#A8A8A8] group-hover:text-white transition-colors shrink-0" />
      )}
    </div>
  );
  if (!href) return inner;
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="block">
      {inner}
    </a>
  );
}
