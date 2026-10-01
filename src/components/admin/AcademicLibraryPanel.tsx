import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  deleteAcademicDocument,
  listAcademicLibrary,
  reprocessAcademicDocument,
  uploadAcademicDocument,
} from "../../lib/academic-library.functions";

type LibraryData = Awaited<ReturnType<typeof listAcademicLibrary>>;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? "");
      const comma = value.indexOf(",");
      resolve(comma >= 0 ? value.slice(comma + 1) : value);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.includes("pdf") || mime.includes("word") || mime.includes("presentation") || mime.includes("spreadsheet")) return FileText;
  if (mime.includes("zip") || mime.includes("archive")) return FileArchive;
  return FileText;
}

export function AcademicLibraryPanel() {
  const list = useServerFn(listAcademicLibrary);
  const upload = useServerFn(uploadAcademicDocument);
  const remove = useServerFn(deleteAcademicDocument);
  const reprocess = useServerFn(reprocessAcademicDocument);

  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [folder, setFolder] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LibraryData["documents"][number] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setError("");
      setLibrary(await list({}));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load academic library.");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const subjects = library?.subjects ?? [];
  const documents = library?.documents ?? [];

  const visibleDocuments = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return documents.filter((doc) => {
      if (folder !== "all" && folder !== "uncategorized" && doc.subject_id !== folder) return false;
      if (folder === "uncategorized" && doc.subject_id) return false;
      if (!needle) return true;
      return [
        doc.file_name,
        doc.title,
        doc.summary,
        doc.document_type,
        doc.lecturer,
        doc.semester,
        ...(doc.tags ?? []),
      ].join(" ").toLowerCase().includes(needle);
    });
  }, [documents, folder, query]);

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const handleFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).slice(0, 5);
    if (!selectedFiles.length) return;
    setUploading(true);
    setError("");
    setUploadStatus("");
    try {
      for (let i = 0; i < selectedFiles.length; i += 1) {
        const file = selectedFiles[i]!;
        if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} is larger than the 15 MB limit.`);
        setUploadStatus(`AI is reading ${file.name} (${i + 1}/${selectedFiles.length})...`);
        const base64 = await readAsBase64(file);
        const result = await upload({
          data: {
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            base64,
          },
        });
        if (result.warning) setError(`${file.name}: ${result.warning}`);
      }
      await refresh();
      setUploadStatus(`${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} organized.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this academic file from the library?")) return;
    try {
      await remove({ data: { id } });
      if (selected?.id === id) setSelected(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete document.");
    }
  };

  const handleReprocess = async (id: string) => {
    try {
      setError("");
      setUploadStatus("AI is re-reading the document and updating its subject folder...");
      const result = await reprocess({ data: { id } });
      setSelected(result.document as LibraryData["documents"][number]);
      await refresh();
      setUploadStatus("Document re-organized.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not re-analyze document.");
    }
  };

  const selectedSubject = selected?.subject_id ? subjectMap.get(selected.subject_id) : null;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 via-white/[0.03] to-sky-500/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10">
              <Brain className="h-6 w-6 text-fuchsia-200" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-200/60">Academic AI</div>
              <h2 className="mt-1 text-xl font-bold">Assignment & Study Library</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-white/55">
                Upload your timetable, modules, assignments, projects, notebooks, slides, exams and course documents. AI reads each file, identifies the subject/module, creates folders and extracts timetable entries.
              </p>
            </div>
          </div>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black hover:bg-white/90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? "Analyzing..." : "Upload files"}
            <input
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg,.webp"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files) void handleFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-white/45">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">PDF</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">Word</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">PowerPoint</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">Excel / CSV</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">Images</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">Notes / Markdown</span>
          <span className="rounded-full border border-amber-300/10 bg-amber-400/5 px-3 py-1.5 text-amber-100/60">15 MB per file</span>
        </div>
      </div>

      {(uploadStatus || error) && (
        <div className={`rounded-xl border px-4 py-3 text-xs ${error ? "border-rose-400/20 bg-rose-500/10 text-rose-200" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"}`}>
          {error || uploadStatus}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)_360px]">
        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Folders</div>
          <button onClick={() => setFolder("all")} className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs ${folder === "all" ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5"}`}>
            <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4" /> All documents</span>
            <span>{documents.length}</span>
          </button>
          {subjects.map((subject) => {
            const count = documents.filter((d) => d.subject_id === subject.id).length;
            return (
              <button key={subject.id} onClick={() => setFolder(subject.id)} className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs ${folder === subject.id ? "bg-sky-400/10 text-sky-100" : "text-white/55 hover:bg-white/5"}`}>
                <span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: subject.color }} /><span className="truncate">{subject.code ? `${subject.code} · ${subject.name}` : subject.name}</span></span>
                <span className="ml-2">{count}</span>
              </button>
            );
          })}
          <button onClick={() => setFolder("uncategorized")} className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs ${folder === "uncategorized" ? "bg-amber-400/10 text-amber-100" : "text-white/55 hover:bg-white/5"}`}>
            <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4" /> Needs review</span>
            <span>{documents.filter((d) => !d.subject_id).length}</span>
          </button>
        </aside>

        <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">{folder === "all" ? "All academic files" : folder === "uncategorized" ? "Needs review" : subjectMap.get(folder)?.name ?? "Subject"}</h3>
              <p className="mt-1 text-xs text-white/40">{visibleDocuments.length} document{visibleDocuments.length === 1 ? "" : "s"}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3">
              <Search className="h-3.5 w-3.5 text-white/35" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files, tags, lecturers..." className="h-9 w-48 bg-transparent text-xs text-white outline-none placeholder:text-white/25" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {visibleDocuments.map((doc) => {
              const Icon = fileIcon(doc.mime_type);
              const subject = doc.subject_id ? subjectMap.get(doc.subject_id) : null;
              return (
                <button key={doc.id} onClick={() => setSelected(doc)} className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-black/15 p-3 text-left hover:border-white/15 hover:bg-white/[0.04]">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5"><Icon className="h-4 w-4 text-sky-200" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">{doc.title || doc.file_name}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-white/40">
                      <span>{subject ? (subject.code ? `${subject.code} · ${subject.name}` : subject.name) : "Needs review"}</span>
                      <span>·</span>
                      <span>{doc.document_type}</span>
                      <span>·</span>
                      <span>{formatBytes(doc.file_size)}</span>
                    </div>
                  </div>
                  {doc.ai_status === "processed" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" /> : <span className="text-[10px] text-amber-200">{doc.ai_status}</span>}
                </button>
              );
            })}
            {!visibleDocuments.length && (
              <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-white/20" />
                <p className="mt-3 text-sm text-white/45">Upload your first assignment, timetable or notebook.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {selected ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/35">AI classification</div>
                  <h3 className="mt-1 font-semibold text-white">{selected.title || selected.file_name}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                {selected.preview_url && selected.mime_type.startsWith("image/") ? (
                  <img src={selected.preview_url} alt={selected.file_name} className="max-h-64 w-full object-contain" />
                ) : selected.preview_url && selected.mime_type.includes("pdf") ? (
                  <iframe title={selected.file_name} src={selected.preview_url} className="h-64 w-full bg-white" />
                ) : (
                  <div className="grid h-32 place-items-center text-center">
                    <FileText className="h-8 w-8 text-white/20" />
                    <span className="text-xs text-white/40">{selected.file_name}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/5 bg-black/15 p-3"><div className="text-[9px] uppercase text-white/30">Subject</div><div className="mt-1 text-xs text-white/75">{selectedSubject?.name || "Needs review"}</div></div>
                <div className="rounded-xl border border-white/5 bg-black/15 p-3"><div className="text-[9px] uppercase text-white/30">Type</div><div className="mt-1 text-xs text-white/75">{selected.document_type}</div></div>
                <div className="rounded-xl border border-white/5 bg-black/15 p-3"><div className="text-[9px] uppercase text-white/30">Semester</div><div className="mt-1 text-xs text-white/75">{selected.semester || "Unknown"}</div></div>
                <div className="rounded-xl border border-white/5 bg-black/15 p-3"><div className="text-[9px] uppercase text-white/30">Confidence</div><div className="mt-1 text-xs text-white/75">{Math.round(Number(selected.ai_confidence ?? 0) * 100)}%</div></div>
              </div>

              {selected.summary && <p className="mt-4 text-xs leading-5 text-white/55">{selected.summary}</p>}
              {selected.tags?.length ? <div className="mt-3 flex flex-wrap gap-1.5">{selected.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/50">#{tag}</span>)}</div> : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {selected.preview_url && <a href={selected.preview_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-black"><Download className="h-3.5 w-3.5" /> Open / download</a>}
                <button onClick={() => void handleReprocess(selected.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70 hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5" /> Re-analyze</button>
                <button onClick={() => void handleDelete(selected.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/15 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-200 hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <FolderOpen className="h-9 w-9 text-white/15" />
              <h3 className="mt-3 font-semibold text-white/70">Select a document</h3>
              <p className="mt-1 max-w-xs text-xs leading-5 text-white/35">The AI classification, subject folder, preview and extracted details will appear here.</p>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-sky-300" />
          <div>
            <h3 className="font-semibold">AI timetable</h3>
            <p className="text-xs text-white/40">Upload a timetable and the AI automatically extracts classes into this schedule.</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead><tr className="border-b border-white/10 text-white/35"><th className="px-3 py-2">Day</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">Room</th><th className="px-3 py-2">Lecturer</th></tr></thead>
            <tbody>
              {(library?.schedule ?? []).map((entry) => {
                const subject = entry.subject_id ? subjectMap.get(entry.subject_id) : null;
                return <tr key={entry.id} className="border-b border-white/5 text-white/65"><td className="px-3 py-2.5">{DAY_NAMES[entry.day_of_week]}</td><td className="px-3 py-2.5">{entry.start_time.slice(0,5)} - {entry.end_time.slice(0,5)}</td><td className="px-3 py-2.5">{subject?.code ? `${subject.code} · ${subject.name}` : subject?.name || "Unknown module"}</td><td className="px-3 py-2.5">{entry.room || "-"}</td><td className="px-3 py-2.5">{entry.lecturer || "-"}</td></tr>;
              })}
            </tbody>
          </table>
          {!library?.schedule?.length && <p className="py-8 text-center text-xs text-white/35">No timetable entries yet. Upload your timetable to populate this automatically.</p>}
        </div>
      </section>
    </div>
  );
}
