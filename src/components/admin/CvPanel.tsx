import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Plus, Trash2, Upload, X } from "lucide-react";

import {
  EMPTY_CV,
  clearCvFile,
  getCvProfile,
  saveCvProfile,
  uploadCvFile,
  type CvProfile,
} from "../../lib/cv.functions";

const input =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">{children}</span>;
}

/** Full CV editor: every field editable, plus upload of your own CV file. */
export function CvPanel() {
  const load = useServerFn(getCvProfile);
  const save = useServerFn(saveCvProfile);
  const upload = useServerFn(uploadCvFile);
  const clear = useServerFn(clearCvFile);
  const fileRef = useRef<HTMLInputElement>(null);

  const [cv, setCv] = useState<CvProfile>(EMPTY_CV);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await load({});
      setCv({ ...EMPTY_CV, ...res.cv });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load the CV.");
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const patch = (p: Partial<CvProfile>) => setCv((c) => ({ ...c, ...p }));

  const submit = async () => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const { file_url: _u, file_name: _n, ...rest } = cv;
      await save({ data: rest });
      setMsg("CV saved. The public CV page now shows these details.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save the CV.");
    } finally {
      setBusy(false);
    }
  };

  const pickFile = async (file: File) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("Could not read that file."));
        r.readAsDataURL(file);
      });
      const res = await upload({ data: { fileName: file.name, dataUrl } });
      patch({ file_url: res.url, file_name: res.fileName });
      setMsg("Your CV file is uploaded. Visitors now download this exact file.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Upload your own CV file</h3>
            <p className="text-sm text-white/50">
              PDF or Word from your computer. When a file is set, the download button serves it instead
              of the generated PDF.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void pickFile(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black disabled:opacity-60"
          >
            <Upload className="h-4 w-4" /> Choose file
          </button>
          {cv.file_url ? (
            <>
              <a
                href={cv.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm"
              >
                <FileText className="h-4 w-4" /> {cv.file_name || "View current file"}
              </a>
              <button
                onClick={async () => {
                  await clear({});
                  patch({ file_url: "", file_name: "" });
                  setMsg("Uploaded file removed. The generated PDF is used again.");
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm text-white/70"
              >
                <X className="h-4 w-4" /> Remove file
              </button>
            </>
          ) : (
            <span className="text-sm text-white/40">No file uploaded yet.</span>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 space-y-5">
        <h3 className="text-base font-semibold">CV details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <Label>Full name</Label>
            <input className={input} value={cv.full_name} onChange={(e) => patch({ full_name: e.target.value })} />
          </label>
          <label>
            <Label>Headline</Label>
            <input className={input} value={cv.headline} onChange={(e) => patch({ headline: e.target.value })} />
          </label>
          <label>
            <Label>Location</Label>
            <input className={input} value={cv.location} onChange={(e) => patch({ location: e.target.value })} />
          </label>
          <label>
            <Label>Email</Label>
            <input className={input} value={cv.email} onChange={(e) => patch({ email: e.target.value })} />
          </label>
          <label>
            <Label>Phone</Label>
            <input className={input} value={cv.phone} onChange={(e) => patch({ phone: e.target.value })} />
          </label>
          <label>
            <Label>Website</Label>
            <input className={input} value={cv.website} onChange={(e) => patch({ website: e.target.value })} />
          </label>
        </div>

        <label className="block">
          <Label>Profile summary</Label>
          <textarea
            rows={4}
            className={input}
            value={cv.summary}
            onChange={(e) => patch({ summary: e.target.value })}
          />
        </label>

        <ListEditor
          title="Skills"
          items={cv.skills}
          onChange={(skills) => patch({ skills })}
          placeholder="React"
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Experience</Label>
            <button
              onClick={() =>
                patch({ experience: [...cv.experience, { role: "", org: "", period: "", detail: "" }] })
              }
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-white/15 px-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add role
            </button>
          </div>
          <div className="space-y-3">
            {cv.experience.map((row, i) => (
              <div key={i} className="rounded-2xl border border-white/10 p-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    className={input}
                    placeholder="Role"
                    value={row.role}
                    onChange={(e) => {
                      const next = [...cv.experience];
                      next[i] = { ...row, role: e.target.value };
                      patch({ experience: next });
                    }}
                  />
                  <input
                    className={input}
                    placeholder="Company"
                    value={row.org}
                    onChange={(e) => {
                      const next = [...cv.experience];
                      next[i] = { ...row, org: e.target.value };
                      patch({ experience: next });
                    }}
                  />
                  <input
                    className={input}
                    placeholder="2022 - present"
                    value={row.period}
                    onChange={(e) => {
                      const next = [...cv.experience];
                      next[i] = { ...row, period: e.target.value };
                      patch({ experience: next });
                    }}
                  />
                </div>
                <textarea
                  rows={2}
                  className={`${input} mt-2`}
                  placeholder="What you delivered"
                  value={row.detail}
                  onChange={(e) => {
                    const next = [...cv.experience];
                    next[i] = { ...row, detail: e.target.value };
                    patch({ experience: next });
                  }}
                />
                <button
                  onClick={() => patch({ experience: cv.experience.filter((_, x) => x !== i) })}
                  className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-full border border-white/15 px-3 text-xs text-white/60"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Education</Label>
            <button
              onClick={() =>
                patch({ education: [...cv.education, { school: "", credential: "", period: "" }] })
              }
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-white/15 px-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add entry
            </button>
          </div>
          <div className="space-y-2">
            {cv.education.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_140px_auto]">
                <input
                  className={input}
                  placeholder="School"
                  value={row.school}
                  onChange={(e) => {
                    const next = [...cv.education];
                    next[i] = { ...row, school: e.target.value };
                    patch({ education: next });
                  }}
                />
                <input
                  className={input}
                  placeholder="Credential"
                  value={row.credential}
                  onChange={(e) => {
                    const next = [...cv.education];
                    next[i] = { ...row, credential: e.target.value };
                    patch({ education: next });
                  }}
                />
                <input
                  className={input}
                  placeholder="Years"
                  value={row.period}
                  onChange={(e) => {
                    const next = [...cv.education];
                    next[i] = { ...row, period: e.target.value };
                    patch({ education: next });
                  }}
                />
                <button
                  onClick={() => patch({ education: cv.education.filter((_, x) => x !== i) })}
                  className="grid min-h-11 w-11 place-items-center rounded-xl border border-white/15 text-white/60"
                  aria-label="Remove education entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <ListEditor
          title="Certifications"
          items={cv.certifications}
          onChange={(certifications) => patch({ certifications })}
          placeholder="Network fundamentals"
        />
        <ListEditor
          title="Languages"
          items={cv.languages}
          onChange={(languages) => patch({ languages })}
          placeholder="English"
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Client ratings</Label>
            <button
              onClick={() => patch({ ratings: [...cv.ratings, { label: "", score: 5 }] })}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-white/15 px-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add rating
            </button>
          </div>
          <div className="space-y-2">
            {cv.ratings.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                <input
                  className={input}
                  placeholder="Delivery on time"
                  value={row.label}
                  onChange={(e) => {
                    const next = [...cv.ratings];
                    next[i] = { ...row, label: e.target.value };
                    patch({ ratings: next });
                  }}
                />
                <input
                  className={input}
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={row.score}
                  onChange={(e) => {
                    const next = [...cv.ratings];
                    next[i] = { ...row, score: Number(e.target.value) };
                    patch({ ratings: next });
                  }}
                />
                <button
                  onClick={() => patch({ ratings: cv.ratings.filter((_, x) => x !== i) })}
                  className="grid min-h-11 w-11 place-items-center rounded-xl border border-white/15 text-white/60"
                  aria-label="Remove rating"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={submit}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save CV
          </button>
          {msg ? <span className="text-sm text-emerald-300">{msg}</span> : null}
          {err ? <span className="text-sm text-rose-300">{err}</span> : null}
        </div>
      </div>
    </div>
  );
}

function ListEditor({
  title,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <Label>{title}</Label>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span
            key={`${it}-${i}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm"
          >
            {it}
            <button
              onClick={() => onChange(items.filter((_, x) => x !== i))}
              aria-label={`Remove ${it}`}
              className="text-white/50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className={input}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
        />
        <button
          onClick={() => {
            if (draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
          className="inline-flex min-h-11 items-center gap-1 rounded-full border border-white/15 px-4 text-sm"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}
