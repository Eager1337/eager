import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload, Link2, Check } from "lucide-react";
import { uploadPortfolioAsset } from "../../lib/portfolio-assets.functions";

/** Reusable "image link OR upload from computer" field for every admin section. */
export function ImageUploadField({
  label = "Image",
  value,
  onChange,
  keyHint,
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  keyHint?: string;
}) {
  const upload = useServerFn(uploadPortfolioAsset);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File) => {
    setErr("");
    setDone(false);
    if (file.size > 12_000_000) {
      setErr("File is larger than 12 MB.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = () => reject(new Error("Could not read the file."));
        fr.readAsDataURL(file);
      });
      const safe = `${keyHint ? keyHint + "-" : ""}${Date.now()}-${file.name}`
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-150);
      const res = await upload({ data: { key: safe, dataUrl } });
      onChange(res.url);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <Link2 className="h-3.5 w-3.5 shrink-0 text-white/40" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste an image link or upload"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-white/30"
          />
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : done ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">{busy ? "Uploading" : "Upload"}</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pick(f);
          e.target.value = "";
        }}
      />
      {err && <div className="mt-1.5 text-[11px] text-rose-300">{err}</div>}
      {value && (
        <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <img src={value} alt={label} loading="lazy" className="max-h-32 w-full object-contain" />
        </div>
      )}
    </div>
  );
}
