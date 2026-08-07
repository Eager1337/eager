import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BellRing,
  Check,
  Fingerprint,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  acknowledgeAlert,
  beginTotpEnrolment,
  confirmTotpEnrolment,
  deletePasskey,
  disableTotp,
  getMfaState,
  getPasskeyChallenge,
  registerPasskey,
  saveAlertSettings,
} from "../../lib/mfa.functions";

type Row = Record<string, any>;

function b64u(bytes: ArrayBuffer) {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64u(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Two-factor authentication, passkeys, sign-in alerts and device trust. */
export function SecurityMfaPanel() {
  const load = useServerFn(getMfaState);
  const begin = useServerFn(beginTotpEnrolment);
  const confirm = useServerFn(confirmTotpEnrolment);
  const disable = useServerFn(disableTotp);
  const challenge = useServerFn(getPasskeyChallenge);
  const register = useServerFn(registerPasskey);
  const removeKey = useServerFn(deletePasskey);
  const saveAlerts = useServerFn(saveAlertSettings);
  const ack = useServerFn(acknowledgeAlert);

  const [state, setState] = useState<Awaited<ReturnType<typeof getMfaState>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [enrol, setEnrol] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState<string[]>([]);
  const [label, setLabel] = useState("This device");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setState(await load({}));
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load security state.");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const addPasskey = () =>
    run(async () => {
      if (!("credentials" in navigator) || !window.PublicKeyCredential) {
        throw new Error("This browser does not support passkeys.");
      }
      const { challenge: ch } = await challenge({});
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge: fromB64u(ch) as unknown as BufferSource,
          rp: { name: "Portfolio OS Admin", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode("portfolio-os-owner") as unknown as BufferSource,
            name: "owner",
            displayName: "Portfolio OS Owner",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
          timeout: 120000,
          attestation: "none",
        },
      })) as PublicKeyCredential | null;
      if (!cred) throw new Error("Passkey creation was cancelled.");
      const response = cred.response as AuthenticatorAttestationResponse;
      await register({
        data: {
          label: label.trim() || "Passkey",
          attestationObject: b64u(response.attestationObject),
          clientDataJSON: b64u(response.clientDataJSON),
        },
      });
      setMsg("Passkey registered. You can now sign in with it.");
      await refresh();
    });

  const totp = state?.totp;
  const settings = (state?.settings ?? {}) as Row;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Access security</h2>
          <p className="mt-1 max-w-2xl text-xs text-white/55">
            Add a second factor, register passkeys for password-free sign-in, and watch every sign-in
            alert raised against the admin area.
          </p>
        </div>
        <button
          onClick={() => void refresh()}
          aria-label="Refresh security state"
          className="grid h-[38px] w-[38px] place-items-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </header>

      {err ? (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">{err}</p>
      ) : null}
      {msg ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">
          {msg}
        </p>
      ) : null}

      {/* 2FA */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-300" /> Two-factor authentication
        </div>
        <p className="mt-1 text-xs text-white/55">
          {totp?.enabled
            ? `Enabled${totp.confirmedAt ? ` on ${new Date(totp.confirmedAt).toLocaleDateString()}` : ""}. ${totp.recoveryCount} recovery codes remain.`
            : "Not enabled. Sign-in currently needs only the username and password."}
        </p>

        {enrol ? (
          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Setup key</div>
              <code className="mt-1 block break-all text-sm text-emerald-200">{enrol.secret}</code>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Or paste this URI</div>
              <code className="mt-1 block break-all text-[11px] text-white/60">{enrol.uri}</code>
            </div>
            <p className="text-xs text-white/55">
              Add the key in Google Authenticator, 1Password or Authy, then type the six digit code below.
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                placeholder="123456"
                className="min-h-[40px] w-32 rounded-lg border border-white/15 bg-black/50 px-3 text-sm tracking-[0.3em] outline-none focus:border-emerald-400"
              />
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const res = await confirm({ data: { code } });
                    setRecovery(res.recoveryCodes);
                    setEnrol(null);
                    setCode("");
                    setMsg("Two-factor authentication is on. Save the recovery codes below.");
                    await refresh();
                  })
                }
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-emerald-400 px-4 text-xs font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> Confirm
              </button>
              <button
                onClick={() => setEnrol(null)}
                className="min-h-[40px] rounded-lg border border-white/15 px-3 text-xs hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {!totp?.enabled ? (
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    setEnrol(await begin({}));
                  })
                }
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-white px-4 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-50"
              >
                <KeyRound className="h-3.5 w-3.5" /> Set up authenticator
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    if (!window.confirm("Turn off two-factor authentication?")) return;
                    await disable({});
                    setMsg("Two-factor authentication is off.");
                    await refresh();
                  })
                }
                className="min-h-[40px] rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 text-xs text-amber-200 hover:bg-amber-400/20 disabled:opacity-50"
              >
                Turn off 2FA
              </button>
            )}
          </div>
        )}

        {recovery.length ? (
          <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">Recovery codes</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-xs text-emerald-100 sm:grid-cols-4">
              {recovery.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-emerald-200/80">
              Each code works once. Store them somewhere safe, they will not be shown again.
            </p>
          </div>
        ) : null}
      </section>

      {/* Passkeys */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Fingerprint className="h-4 w-4 text-sky-300" /> Passkeys
        </div>
        <p className="mt-1 text-xs text-white/55">
          Register Face ID, Touch ID, Windows Hello or a security key. Sign in from the admin screen with
          no password at all.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Device name"
            className="min-h-[40px] flex-1 rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400 sm:max-w-xs"
          />
          <button
            disabled={busy}
            onClick={() => void addPasskey()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-white px-4 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-50"
          >
            <Fingerprint className="h-3.5 w-3.5" /> Register passkey
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {(state?.passkeys ?? []).map((k: Row) => (
            <li
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm">{k.label}</div>
                <div className="text-[11px] text-white/45">
                  Added {new Date(k.created_at).toLocaleDateString()}
                  {k.last_used_at ? ` · last used ${new Date(k.last_used_at).toLocaleString()}` : " · never used"}
                </div>
              </div>
              <button
                onClick={() =>
                  void run(async () => {
                    await removeKey({ data: { id: k.id } });
                    await refresh();
                  })
                }
                aria-label={`Remove ${k.label}`}
                className="grid h-8 w-8 place-items-center rounded-lg border border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {!loading && !(state?.passkeys ?? []).length ? (
            <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-white/45">
              No passkeys registered yet.
            </li>
          ) : null}
        </ul>
      </section>

      {/* Alerts */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BellRing className="h-4 w-4 text-amber-300" /> Sign-in alerts
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              Alert email
            </span>
            <input
              defaultValue={String(settings.email ?? "")}
              onBlur={(e) =>
                void run(async () => {
                  await saveAlerts({
                    data: {
                      email: e.target.value,
                      alert_on_success: Boolean(settings.alert_on_success ?? true),
                      alert_on_failure: Boolean(settings.alert_on_failure ?? true),
                      alert_on_new_device: Boolean(settings.alert_on_new_device ?? true),
                    },
                  });
                  setMsg("Alert settings saved.");
                  await refresh();
                })
              }
              placeholder="you@example.com"
              className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-amber-400"
            />
          </label>
          {(
            [
              ["alert_on_success", "Alert on every successful sign-in"],
              ["alert_on_failure", "Alert on failed attempts"],
              ["alert_on_new_device", "Alert on a new device"],
            ] as const
          ).map(([key, text]) => (
            <label key={key} className="flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                checked={Boolean(settings[key] ?? true)}
                onChange={(e) =>
                  void run(async () => {
                    await saveAlerts({
                      data: {
                        email: String(settings.email ?? ""),
                        alert_on_success: Boolean(settings.alert_on_success ?? true),
                        alert_on_failure: Boolean(settings.alert_on_failure ?? true),
                        alert_on_new_device: Boolean(settings.alert_on_new_device ?? true),
                        [key]: e.target.checked,
                      } as any,
                    });
                    await refresh();
                  })
                }
                className="h-4 w-4 accent-amber-400"
              />
              {text}
            </label>
          ))}
        </div>

        <div className="mt-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="text-white/45">
              <tr>
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">When</th>
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">Event</th>
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">Detail</th>
                <th className="border-b border-white/10 pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(state?.alerts ?? []).map((a: Row) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="whitespace-nowrap py-2.5 pr-4 text-white/60">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={
                        a.severity === "critical"
                          ? "text-red-300"
                          : a.severity === "warning"
                            ? "text-amber-300"
                            : "text-emerald-300"
                      }
                    >
                      {a.event}
                    </span>
                  </td>
                  <td className="max-w-[280px] truncate py-2.5 pr-4 text-white/70">{a.detail}</td>
                  <td className="py-2.5 text-right">
                    {a.acknowledged ? (
                      <span className="text-white/40">Seen</span>
                    ) : (
                      <button
                        onClick={() =>
                          void run(async () => {
                            await ack({ data: { id: a.id } });
                            await refresh();
                          })
                        }
                        className="rounded-lg border border-white/15 px-2 py-1 hover:bg-white/10"
                      >
                        Mark seen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !(state?.alerts ?? []).length ? (
            <p className="py-6 text-center text-xs text-white/45">No sign-in alerts yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
