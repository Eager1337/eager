import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Paperclip, X, FileVideo, FileText, ImageIcon } from "lucide-react";
import { uploadPortfolioAsset } from "../../lib/portfolio-assets.functions";

export type Attachment = { name: string; url: string; type: string };

function iconFor(type: string) {
  if (type.startsWith("video")) return FileVideo;
  if (type.startsWith("image")) return ImageIcon;
  return FileText;
}

/**
 * Multi-file attachment field. Accepts images, videos, documents and zips,
 * stores them in the media bucket and hands back public links so the AI
 * prompt (or a build) can reference them.
 */
export function AttachmentField({
  label = "Attach files or videos",
  hint = "Images, videos, PDFs, docs or zips. Up to 12 MB each.",
  keyHint = "attach",
  value,
  onChange,
}: {
  label?: string;
  hint?: string;
  keyHint?: string;
  value: Attachment[];
  onChange: (next: Attachment[]) => void;
}) {
  const upload = useServerFn(uploadPortfolioAsset);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const add = async (files: File[]) => {
    setErr("");
    setBusy(true);
    const added: Attachment[] = [];
    try {
      for (const file of files) {
        if (file.size > 12_000_000) {
          setErr(`${file.name} is larger than 12 MB and was skipped.`);
          continue;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.onerror = () => reject(new Error(`Could not read ${file.name}.`));
          fr.readAsDataURL(file);
        });
        const key = `${keyHint}-${Date.now()}-${file.name}`
          .replace(/[^a-zA-Z0-9._-]/g, "-")
          .slice(-150);
        const res = await upload({ data: { key, dataUrl } });
        added.push({ name: file.name, url: res.url, type: file.type || "application/octet-stream" });
      }
      if (added.length) onChange([...value, ...added]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
        {busy ? "Uploading" : "Choose files"}
      </button>
      <p className="mt-1.5 text-[10px] text-white/35">{hint}</p>
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) void add(files);
          e.target.value = "";
        }}
      />
      {err ? <div className="mt-1.5 text-[11px] text-rose-300">{err}</div> : null}
      {value.length ? (
        <ul className="mt-2 space-y-1.5">
          {value.map((a, i) => {
            const Icon = iconFor(a.type);
            return (
              <li
                key={`${a.url}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[11px]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-white/45" />
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-white/70 hover:text-white"
                >
                  {a.name}
                </a>
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/10 hover:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Turn attachments into a prompt fragment the model can use. */
export function attachmentsPrompt(items: Attachment[], origin = "") {
  if (!items.length) return "";
  const lines = items.map(
    (a) => `- ${a.name} (${a.type}): ${origin ? origin.replace(/\/$/, "") + a.url : a.url}`,
  );
  return `Reference files supplied by the owner. Use the image and video links directly in the output where they fit:\n${lines.join("\n")}`;
}
