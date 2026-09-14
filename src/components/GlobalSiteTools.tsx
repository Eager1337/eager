import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Search, Sun, X, ArrowRight, LayoutDashboard, LayoutGrid, User, BarChart3, TrendingUp, ShieldCheck, Fingerprint, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PAGES } from "../data/pages";
import { FEATURES } from "../data/features";
import { useContent } from "../lib/content-store";
import { useInvestorMode } from "../lib/investor-mode";
import { passkeyLogin } from "../lib/owner-auth.functions";
import { supabase } from "../integrations/supabase/client";

type Result = { id: string; label: string; meta: string; to: string };

function b64u(bytes: ArrayBuffer) {
  let bin = ""; for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64u(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i); return out;
}

export function GlobalSiteTools() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [adminSession, setAdminSession] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const doPasskey = useServerFn(passkeyLogin);
  const { projects, legends, landings } = useContent();
  const { investorMode, toggle: toggleInvestor, hydrated: investorHydrated } = useInvestorMode();
  const onAbout = location.pathname === "/portfolio";
  const isAdmin = location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-theme-mode") as "dark" | "light" | null;
    const next = saved ?? "dark"; setTheme(next); document.documentElement.dataset.themeMode = next;
    void supabase.auth.getSession().then(({ data }) => setAdminSession(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAdminSession(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  const toggleTheme = () => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); document.documentElement.dataset.themeMode = next; window.localStorage.setItem("portfolio-theme-mode", next); };

  const signInWithPasskey = async () => {
    if (passkeyBusy) return;
    setPasskeyBusy(true); setPasskeyError("");
    try {
      if (!("credentials" in navigator) || !window.PublicKeyCredential) throw new Error("This browser does not support passkeys.");
      const challengeRes = await (await import("../lib/mfa.functions")).getPasskeyChallenge({});
      const cred = await navigator.credentials.get({ publicKey: { challenge: fromB64u(challengeRes.challenge) as unknown as BufferSource, rpId: window.location.hostname, userVerification: "required", timeout: 120000 } }) as PublicKeyCredential | null;
      if (!cred) throw new Error("Passkey sign-in was cancelled.");
      const response = cred.response as AuthenticatorAssertionResponse;
      const result = await doPasskey({ data: { credentialId: b64u(cred.rawId), clientDataJSON: b64u(response.clientDataJSON), authenticatorData: b64u(response.authenticatorData), signature: b64u(response.signature), origin: window.location.origin } });
      if (!result.ok || !result.access_token || !result.refresh_token) throw new Error(result.error ?? "Passkey sign-in failed.");
      const { error } = await supabase.auth.setSession({ access_token: result.access_token, refresh_token: result.refresh_token });
      if (error) throw new Error(error.message);
      setAdminSession(true); navigate({ to: "/admin" });
    } catch (e) { setPasskeyError(e instanceof Error ? e.message : "Passkey sign-in failed."); }
    finally { setPasskeyBusy(false); }
  };

  const items = useMemo<Result[]>(() => [
    { id: "home", label: "Home", meta: "Page", to: "/" },
    { id: "explore", label: "Explore projects", meta: "Project grid", to: "/explore" },
    { id: "legends", label: "Legends", meta: "Cinematic pages", to: "/legends" },
    { id: "portfolio", label: "About Eager Beaver", meta: "Portfolio", to: "/portfolio" },
    ...projects.map((p) => ({ id: `p-${p.slug}`, label: p.title, meta: `${p.category} case study`, to: `/explore/${p.slug}` })),
    ...projects.map((p) => ({ id: `pl-${p.slug}`, label: `${p.title} landing`, meta: "Premium landing page", to: `/landing/${p.slug}` })),
    ...legends.map((l) => ({ id: `l-${l.slug}`, label: l.title, meta: "Legend", to: `/legends/${l.slug}` })),
    ...landings.map((l) => ({ id: `c-${l.slug}`, label: l.title, meta: "Custom landing", to: `/landing/${l.slug}` })),
    ...PAGES.slice(0, 50).map((p) => ({ id: `os-${p.slug}`, label: p.title, meta: `Portfolio OS · ${p.group}`, to: `/portfolio-os/${p.slug}` })),
    ...FEATURES.slice(0, 50).map((f) => ({ id: `f-${f.id}`, label: f.name, meta: `Feature · ${f.group}`, to: `/portfolio-os#feature-${f.id}` })),
  ], [landings, legends, projects]);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); if (!q) return items.slice(0, 10); return items.filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(q)).slice(0, 18); }, [items, query]);
  const go = (to: string) => { setSearchOpen(false); setQuery(""); navigate({ to: to as never }); };

  return <>
    <AnimatePresence>{isAdmin ? <motion.header initial={{ y: -32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-x-0 top-0 z-[220] border-b border-fuchsia-400/20 bg-[#070711]/95 px-4 py-2.5 text-white shadow-2xl backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3"><Link to="/admin" className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20"><ShieldCheck className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-[9px] font-semibold uppercase tracking-[0.28em] text-white/40">Eager Beaver · Portfolio OS</span><span className="block truncate text-sm font-bold">Admin Dashboard</span></span></Link><div className="hidden items-center gap-2 text-[11px] text-white/45 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Private admin area</div><div className="flex items-center gap-2">{!adminSession ? <button onClick={() => void signInWithPasskey()} disabled={passkeyBusy} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 text-[11px] text-sky-100 disabled:opacity-50">{passkeyBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Fingerprint className="h-3 w-3" />} Passkey sign-in</button> : null}<Link to="/" className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] hover:bg-white/10">Back to site</Link></div></div>{passkeyError ? <div className="mx-auto mt-2 max-w-[1500px] rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-[11px] text-red-200">{passkeyError}</div> : null}</motion.header> : null}</AnimatePresence>

    <AnimatePresence>{investorHydrated && investorMode && !isAdmin ? <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} className="fixed inset-x-0 top-0 z-[130] border-b border-amber-300/40 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black shadow-xl"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-center text-[12px] font-semibold sm:text-sm"><span className="inline-flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Investor Mode</span><span className="opacity-80">Ships production apps in weeks, not months</span><span className="opacity-80">50+ features across 52 shipped pages</span><span className="opacity-80">Full-stack · systems · measurable impact</span><button onClick={toggleInvestor} className="rounded-full bg-black/85 px-3 py-1 text-[11px] font-bold text-amber-300 hover:bg-black">Exit</button></div></motion.div> : null}</AnimatePresence>

    <div className="fixed bottom-3 left-3 right-3 z-[120] grid grid-cols-[auto_auto_1fr] items-center gap-2 sm:left-auto sm:right-4 sm:flex sm:w-auto"><button onClick={() => setSearchOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/75 px-4 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl sm:min-w-40 sm:justify-start"><Search className="h-4 w-4" /><span className="hidden sm:inline">Search</span></button><button onClick={toggleTheme} aria-label="Toggle dark and light mode" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/75 text-white shadow-2xl backdrop-blur-xl">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><div className="flex min-w-0 justify-end gap-2 overflow-x-auto sm:overflow-visible">{!isAdmin ? <><button onClick={toggleInvestor} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 text-xs font-semibold text-white shadow-2xl"><TrendingUp className="h-3.5 w-3.5" /> Investor Mode</button><Link to="/portfolio" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 text-xs font-semibold text-white shadow-2xl"><User className="h-3.5 w-3.5" /> About</Link><Link to="/portfolio-os" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 text-xs font-semibold text-white shadow-2xl"><LayoutGrid className="h-3.5 w-3.5" /> Portfolio OS</Link></> : null}<Link to="/admin" className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-2xl ${isAdmin ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-white" : "border-white/20 bg-black/75 text-white"}`}><LayoutDashboard className="h-3.5 w-3.5" /> Admin</Link>{!isAdmin ? <Link to="/portfolio-os/suite" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-3 text-xs font-semibold text-white shadow-2xl"><BarChart3 className="h-3.5 w-3.5" /> Suite</Link> : null}</div></div>

    <AnimatePresence>{searchOpen ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[350] bg-black/75 p-3 pt-16 backdrop-blur-xl sm:p-6 sm:pt-[12vh]" onClick={() => setSearchOpen(false)}><motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} onClick={(e) => e.stopPropagation()} className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 text-white shadow-2xl"><div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/10 px-4 py-4"><Search className="h-5 w-5 text-white/60" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find Explore projects, pages, case studies..." className="min-w-0 bg-transparent text-base outline-none" /><button onClick={() => setSearchOpen(false)} className="rounded-full p-2 text-white/60"><X className="h-5 w-5" /></button></div><div className="max-h-[65vh] overflow-y-auto p-2">{filtered.map((item) => <button key={item.id} onClick={() => go(item.to)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-4 py-3 text-left hover:bg-white/10"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.label}</span><span className="block truncate text-xs text-white/50">{item.meta}</span></span><ArrowRight className="h-4 w-4 text-white/40" /></button>)}{!filtered.length ? <div className="px-4 py-10 text-center text-sm text-white/50">No matching result.</div> : null}</div></motion.div></motion.div> : null}</AnimatePresence>
  </>;
}
