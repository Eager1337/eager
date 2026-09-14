import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Code2, Palette, Megaphone, FileSignature, PenLine, Search, LineChart, NotebookPen, BookMarked, Loader2, Send, Copy, Trash2, ImagePlus, Sparkles } from "lucide-react";
import { askWorkspaceAi, generateStudioImage } from "../../lib/ai-workspace.functions";
import { ProjectConnectionsPanel } from "./ProjectConnectionsPanel";

type Msg = { role: "user" | "assistant"; content: string };
const ASSISTANTS = [
  { id: "coding", name: "Coding assistant", icon: Code2, task: "Explain code, generate production-ready snippets, debug and refactor.", starter: "Review this project and tell me what I should improve:" },
  { id: "uiux", name: "UI/UX assistant", icon: Palette, task: "Generate UI ideas, layout critiques and design-system decisions.", starter: "Give me a premium layout for my current project." },
  { id: "marketing", name: "Marketing assistant", icon: Megaphone, task: "Write campaigns, launch copy and positioning.", starter: "Write launch copy for this project." },
  { id: "proposal", name: "Proposal writer", icon: FileSignature, task: "Draft client proposals, scopes and pricing rationale.", starter: "Draft a proposal for this project." },
  { id: "content", name: "Content writer", icon: PenLine, task: "Write blog drafts, case studies and long-form content.", starter: "Turn this project into a case study." },
  { id: "seo", name: "SEO assistant", icon: Search, task: "Keyword plans, metadata, structured data and on-page fixes.", starter: "Audit the SEO of this project." },
  { id: "analyst", name: "Business analyst", icon: LineChart, task: "Unit economics, pricing models, revenue and growth analysis.", starter: "Analyze the business opportunity behind this project." },
  { id: "meetings", name: "Meeting summarizer", icon: NotebookPen, task: "Turn raw notes into decisions, owners and next actions.", starter: "Summarize these notes into actions:" },
  { id: "docs", name: "Documentation assistant", icon: BookMarked, task: "Technical docs, API references and database schemas.", starter: "Create technical documentation for this project." },
  { id: "research", name: "Research assistant", icon: Bot, task: "Research topics, compare technologies, summarise findings.", starter: "Research competitors and technologies for this project." },
] as const;

export function AiWorkspacePanel() {
  const [tab, setTab] = useState<"chat" | "studio">("chat");
  return <div className="min-w-0 space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold sm:text-2xl">AI Workspace</h2><p className="mt-1 text-xs text-white/50">AI assistants, project connections, build context and image generation in one workspace.</p></div><div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">{(["chat", "studio"] as const).map((k) => <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-3 py-2 text-xs ${tab === k ? "bg-white/15" : "text-white/55"}`}>{k === "chat" ? "Assistants" : "Image Studio"}</button>)}</div></header>
    <ProjectConnectionsPanel compact />
    {tab === "chat" ? <Assistants /> : <ImageStudio />}
  </div>;
}

function Assistants() {
  const ask = useServerFn(askWorkspaceAi);
  const [active, setActive] = useState<string>(ASSISTANTS[0].id);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});
  const [projectContext, setProjectContext] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const assistant = useMemo(() => ASSISTANTS.find((a) => a.id === active) ?? ASSISTANTS[0], [active]);
  const messages = threads[active] ?? [];

  useEffect(() => {
    try { const raw = localStorage.getItem("ai-workspace-threads"); if (raw) setThreads(JSON.parse(raw) as Record<string, Msg[]>); setProjectContext(localStorage.getItem("ai-workspace-context") ?? ""); } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("ai-workspace-threads", JSON.stringify(threads)); } catch { /* ignore */ } }, [threads]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length, busy]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim(); if (!text || busy) return;
    setErr(""); setInput(""); const next = [...messages, { role: "user" as const, content: text }]; setThreads((t) => ({ ...t, [active]: next })); setBusy(true);
    try { const res = await ask({ data: { messages: next.slice(-20), task: `${assistant.name}. ${assistant.task}`, context: projectContext.slice(0, 20000) } }); setThreads((t) => ({ ...t, [active]: [...next, { role: "assistant", content: res.text }] })); }
    catch (e) { setErr(e instanceof Error ? e.message : "The assistant could not respond."); }
    finally { setBusy(false); }
  };

  return <div className="grid min-w-0 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
    <aside className="space-y-3"><div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col">{ASSISTANTS.map((a) => { const Icon = a.icon; return <button key={a.id} onClick={() => setActive(a.id)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 text-left text-xs lg:w-full ${a.id === active ? "border-fuchsia-400/50 bg-fuchsia-500/15" : "border-white/10 bg-white/[0.02] text-white/60"}`}><Icon className="h-4 w-4" /><span className="truncate">{a.name}</span></button>; })}</div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3"><div className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40">Active project context</div><textarea value={projectContext} onChange={(e) => { setProjectContext(e.target.value); try { localStorage.setItem("ai-workspace-context", e.target.value); } catch { /* ignore */ } }} rows={7} placeholder="Paste project docs, client brief, GitHub notes, API details or requirements here." className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs outline-none" /></div>
    </aside>
    <section className="flex min-h-[58vh] min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.02]"><div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3"><div><div className="text-sm font-semibold">{assistant.name}</div><div className="text-[11px] text-white/40">{assistant.task}</div></div><button onClick={() => setThreads((t) => ({ ...t, [active]: [] }))} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px]"><Trash2 className="h-3.5 w-3.5" /> Clear</button></div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.length === 0 ? <button onClick={() => void send(assistant.starter)} className="w-full rounded-xl border border-dashed border-white/15 p-4 text-left text-xs text-white/55"><Sparkles className="mb-2 h-4 w-4 text-fuchsia-300" />{assistant.starter}</button> : null}{messages.map((m, i) => <div key={i} className={`rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "ml-auto max-w-[85%] bg-white/10" : "bg-black/30"}`}><div className="whitespace-pre-wrap break-words">{m.content}</div>{m.role === "assistant" ? <button onClick={() => void navigator.clipboard.writeText(m.content)} className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/40"><Copy className="h-3 w-3" /> Copy</button> : null}</div>)}{busy ? <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/50"><Loader2 className="h-4 w-4 animate-spin" /> Thinking</div> : null}{err ? <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{err}</div> : null}<div ref={endRef} /></div>
      <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-white/10 p-3"><textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder={`Ask the ${assistant.name.toLowerCase()}`} className="min-w-0 resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none" /><button disabled={busy || !input.trim()} className="inline-flex min-h-11 items-center gap-1.5 self-end rounded-xl bg-white px-4 text-sm font-semibold text-black disabled:opacity-40"><Send className="h-4 w-4" /> Send</button></form>
    </section>
  </div>;
}

function ImageStudio() {
  const gen = useServerFn(generateStudioImage);
  const [prompt, setPrompt] = useState(""); const [size, setSize] = useState<"1024x1024" | "1024x1536" | "1536x1024">("1024x1024"); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [images, setImages] = useState<{ prompt: string; image: string }[]>([]);
  const run = async () => { if (prompt.trim().length < 3 || busy) return; setBusy(true); setErr(""); try { const res = await gen({ data: { prompt: prompt.trim(), size } }); setImages((p) => [{ prompt: prompt.trim(), image: res.image }, ...p]); } catch (e) { setErr(e instanceof Error ? e.message : "Image generation failed."); } finally { setBusy(false); } };
  return <div className="space-y-4"><div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Describe an image for your current project..." className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none" /><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><div className="flex gap-1.5">{(["1024x1024", "1024x1536", "1536x1024"] as const).map((s) => <button key={s} onClick={() => setSize(s)} className={`rounded-lg border px-2.5 py-2 text-[11px] ${size === s ? "border-white/40 bg-white/15" : "border-white/10 bg-white/[0.03] text-white/50"}`}>{s}</button>)}</div><button onClick={() => void run()} disabled={busy || prompt.trim().length < 3} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black disabled:opacity-40">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Generate</button></div>{err ? <div className="mt-3 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{err}</div> : null}</div><div className="grid gap-4 sm:grid-cols-2">{images.map((image, i) => <article key={`${image.prompt}-${i}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"><img src={image.image} alt={image.prompt} className="aspect-square w-full object-cover" /><div className="p-3"><p className="text-xs text-white/55">{image.prompt}</p></div></article>)}</div></div>;
}
