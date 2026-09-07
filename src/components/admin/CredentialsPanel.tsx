import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import {
  getAdminCredentialState,
  resetAdminCredentials,
  updateAdminCredentials,
} from "../../lib/admin-credentials.functions";

/** Change the dashboard sign-in username and password from inside the dashboard. */
export function CredentialsPanel() {
  const load = useServerFn(getAdminCredentialState);
  const save = useServerFn(updateAdminCredentials);
  const reset = useServerFn(resetAdminCredentials);

  const [state, setState] = useState<{
    username: string;
    source: string;
    updatedAt: string | null;
  } | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await load({});
      setState(res);
      setUsername(res.username);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not read the current sign-in name.");
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = async () => {
    setErr("");
    setMsg("");
    if (password !== confirm) {
      setErr("The two passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await save({ data: { username: username.trim(), password } });
      setPassword("");
      setConfirm("");
      setMsg("Saved. Use the new username and password the next time you sign in.");
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save the new credentials.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "min-h-[44px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-emerald-400";
  const label = "mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45";

  return (
    <div className="space-y-5">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <KeyRound className="h-4 w-4 text-emerald-300" /> Sign-in credentials
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-white/55">
          Change the username and password you type on the admin screen. The password is stored
          hashed, never in plain text, and the change follows the site to any deployment because it
          lives in the database, not in the code.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/55">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
          Current username: <strong className="text-white">{state?.username || "not set"}</strong>
          <span className="text-white/30">·</span>
          {state?.source === "dashboard" ? "set here in the dashboard" : "coming from deployment settings"}
          {state?.updatedAt ? (
            <>
              <span className="text-white/30">·</span> updated{" "}
              {new Date(state.updatedAt).toLocaleString()}
            </>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={label}>New username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className={label}>New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              autoComplete="new-password"
            />
          </label>
          <label className="block">
            <span className={label}>Repeat password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={field}
              autoComplete="new-password"
            />
          </label>
        </div>

        {err ? (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">
            {err}
          </p>
        ) : null}
        {msg ? (
          <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">
            {msg}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            disabled={busy || username.trim().length < 3 || password.length < 8}
            onClick={() => void submit()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-5 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Save new credentials
          </button>
          <button
            onClick={() =>
              void (async () => {
                if (!window.confirm("Go back to the credentials stored in deployment settings?")) return;
                await reset({});
                setMsg("Reverted to the deployment settings credentials.");
                await refresh();
              })()
            }
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" /> Revert to deployment values
          </button>
        </div>
      </section>
    </div>
  );
}
