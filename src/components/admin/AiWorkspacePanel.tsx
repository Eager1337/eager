import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Bot,
  Code2,
  Palette,
  Megaphone,
  FileSignature,
  PenLine,
  Search,
  LineChart,
  NotebookPen,
  BookMarked,
  Loader2,
  Send,
  Copy,
  Trash2,
  ImagePlus,
  Download,
  Sparkles,
} from "lucide-react";
import { askWorkspaceAi, generateStudioImage } from "../../lib/ai-workspace.functions";

type Msg = { role: "user" | "assistant"; content: string };

const ASSISTANTS = [
  { id: "coding", name: "Coding assistant", icon: Code2, task: "Explain code, generate production-ready snippets, debug and refactor.", starter: "Explain this function and suggest a cleaner version:" },
  { id: "uiux", name: "UI/UX assistant", icon: Palette, task: "Generate UI ideas, layout critiques and design-system decisions.", starter: "Give me three layout directions for a premium pricing page." },
  { id: "marketing", name: "Marketing assistant", icon: Megaphone, task: "Write campaigns, launch copy and positioning.", starter: "Write a launch campaign for my portfolio OS." },
  { id: "proposal", name: "Proposal writer", icon: FileSignature, task: "Draft client proposals, scopes and pricing rationale.", starter: "Draft a proposal for a 12-page logistics site with auth and analytics." },
  { id: "content", name: "Content writer", icon: PenLine, task: "Write blog drafts, case studies and long-form content.", starter: "Write a blog draft about shipping a portfolio as an operating system." },
  { id: "seo", name: "SEO assistant", icon: Search, task: "Keyword plans, metadata, structured data and on-page fixes.", starter: "Give me titles, meta descriptions and schema for my services page." },
  { id: "analyst", name: "Business analyst", icon: LineChart, task: "Unit economics, pricing models, revenue and growth analysis.", starter: "Model monthly revenue if I sell 3 growth sites and 2 retainers." },
  { id: "meetings", name: "Meeting summarizer", icon: NotebookPen, task: "Turn raw notes into decisions, owners and next actions.", starter: "Summarise these meeting notes into decisions and action items:" },
  { id: "docs", name: "Documentation assistant", icon: BookMarked, task: "Technical docs, API references and database schemas.", starter: "Generate a Postgres schema for a client CRM with RLS." },
  { id: "research", name: "Research assistant", icon: Bot, task: "Research topics, compare technologies, summarise findings.", starter: "Compare TanStack Start and Next.js for an investor-grade portfolio." },
] as const;

export function AiWorkspacePanel() {
  const [tab, setTab] = useState<"chat" | "studio">("chat");
  return (
    <div className="min-w-0 space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold sm:text-2xl">AI Workspace</h2>
          <p className="mt-1 text-xs text-white/50">
            Ten specialist assistants plus an image studio, running on built-in Lovable AI.
          </p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(["chat", "studio"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-lg px-3 py-2 text-xs capitalize ${
                tab === k ? "bg-white/15 text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {k === "chat" ? "Assistants" : "Image Studio"}
            </button>
          ))}
        </div>
      </header>
      {tab === "chat" ? <Assistants /> : <ImageStudio />}
    </div>
  );
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

  const assistant = useMemo(
    () => ASSISTANTS.find((a) => a.id === active) ?? ASSISTANTS[0],
    [active],
  );
  const messages = threads[active] ?? [];

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ai-workspace-threads");
      if (raw) setThreads(JSON.parse(raw) as Record<string, Msg[]>);
      setProjectContext(localStorage.getItem("ai-workspace-context") ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ai-workspace-threads", JSON.stringify(threads));
    } catch {
      /* ignore */
    }
  }, [threads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setErr("");
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setThreads((t) => ({ ...t, [active]: next }));
    setBusy(true);
    try {
      const res = await ask({
        data: {
          messages: next.slice(-20),
          task: `${assistant.name}. ${assistant.task}`,
          context: projectContext.slice(0, 20000),
        },
      });
      setThreads((t) => ({
        ...t,
        [active]: [...next, { role: "assistant", content: res.text }],
      }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The assistant could not respond.");
      setThreads((t) => ({ ...t, [active]: next }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {ASSISTANTS.map((a) => {
            const Icon = a.icon;
            const on = a.id === active;
            return (
              <button
                key={a.id}
                onClick={() => setActive(a.id)}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-xs lg:w-full ${
                  on
                    ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{a.name}</span>
              </button>
            );
          })}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          <div className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-white/45">
            Project documentation
          </div>
          <textarea
            value={projectContext}
            onChange={(e) => {
              setProjectContext(e.target.value);
              try {
                localStorage.setItem("ai-workspace-context", e.target.value);
              } catch {
                /* ignore */
              }
            }}
            rows={6}
            placeholder="Paste project docs, client briefs or meeting notes. Every assistant searches this context."
            className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs outline-none placeholder:text-white/30"
          />
        </div>
      </aside>

      <section className="flex min-h-[60vh] min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{assistant.name}</div>
            <div className="truncate text-[11px] text-white/45">{assistant.task}</div>
          </div>
          <button
            onClick={() => setThreads((t) => ({ ...t, [active]: [] }))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-[11px] hover:bg-white/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <button
              onClick={() => void send(assistant.starter)}
              className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-left text-xs text-white/55 hover:bg-white/[0.05]"
            >
              <Sparkles className="mb-2 h-4 w-4 text-fuchsia-300" />
              {assistant.starter}
            </button>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-full rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto max-w-[92%] border-white/15 bg-white/10 sm:max-w-[80%]"
                  : "border-white/10 bg-black/30"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{m.content}</div>
              {m.role === "assistant" && (
                <button
                  onClick={() => void navigator.clipboard.writeText(m.content)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              )}
            </div>
          ))}
          {busy && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking
            </div>
          )}
          {err && (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {err}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-white/10 p-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={2}
            placeholder={`Ask the ${assistant.name.toLowerCase()}`}
            className="min-w-0 resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 self-end rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" /> <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </section>
    </div>
  );
}

function ImageStudio() {
  const gen = useServerFn(generateStudioImage);
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1024x1536" | "1536x1024">("1024x1024");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [images, setImages] = useState<{ prompt: string; image: string }[]>([]);

  const run = async () => {
    if (prompt.trim().length < 3 || busy) return;
    setErr("");
    setBusy(true);
    try {
      const res = await gen({ data: { prompt: prompt.trim(), size } });
      setImages((p) => [{ prompt: prompt.trim(), image: res.image }, ...p]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Image generation failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Describe the image. Example: cinematic dark product shot of a logistics dashboard on a phone, red accent lighting."
          className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none placeholder:text-white/30"
        />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {(["1024x1024", "1024x1536", "1536x1024"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-lg border px-2.5 py-2 text-[11px] ${
                  size === s
                    ? "border-white/40 bg-white/15"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
                }`}
              >
                {s.replace("x", " × ")}
              </button>
            ))}
          </div>
          <button
            onClick={() => void run()}
            disabled={busy || prompt.trim().length < 3}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Generate
          </button>
        </div>
        {err && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {err}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((img, i) => (
          <figure key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <img src={img.image} alt={img.prompt} className="w-full object-cover" />
            <figcaption className="space-y-2 p-3">
              <p className="line-clamp-2 text-[11px] text-white/50">{img.prompt}</p>
              <a
                href={img.image}
                download={`studio-${i}.png`}
                className="inline-flex items-center gap-1.5 text-[11px] text-white/70 hover:text-white"
              >
                <Download className="h-3 w-3" /> Download
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
