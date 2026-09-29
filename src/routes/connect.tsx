import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AudioLines, Camera, CameraOff, Check, Heart, Mic, MicOff, MonitorUp, PhoneCall,
  PhoneOff, Search, ShieldCheck, Smile, Users, Video,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

type Profile = {
  id: string; username: string; display_name: string; avatar_url: string | null;
  bio: string; is_verified: boolean; last_seen_at: string;
};
type Call = {
  id: string; caller_id: string; callee_id: string;
  mode: "voice" | "video"; status: "ringing" | "active" | "declined" | "missed" | "ended";
  created_at: string;
};
type Signal = { id: string; sender_id: string; kind: string; payload: any };

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const Route = createFileRoute("/connect")({
  head: () => ({ meta: [
    { title: "Eager Connect — Voice & Video Calls" },
    { name: "description", content: "Eager voice, video, screen sharing and in-call chat." },
  ]}),
  component: ConnectPage,
});

const db = () => supabase as any;

function Avatar({ profile, large = false }: { profile?: Partial<Profile> | null; large?: boolean }) {
  const name = profile?.display_name || profile?.username || "E";
  const letters = name.split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  return profile?.avatar_url
    ? <img src={profile.avatar_url} alt="" className={`${large ? "h-20 w-20 text-xl" : "h-11 w-11 text-sm"} rounded-full border border-white/10 object-cover`} />
    : <div className={`${large ? "h-20 w-20 text-xl" : "h-11 w-11 text-sm"} grid place-items-center rounded-full border border-white/10 bg-white/10 font-bold`}>{letters}</div>;
}

function ConnectPage() {
  const [user, setUser] = useState<any>(null);
  const [me, setMe] = useState<Profile | null>(null);
  const [people, setPeople] = useState<Profile[]>([]);
  const [incoming, setIncoming] = useState<Call | null>(null);
  const [active, setActive] = useState<Call | null>(null);
  const [remote, setRemote] = useState<Profile | null>(null);
  const [search, setSearch] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [name, setName] = useState(""); const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  const loadPeople = useCallback(async (uid: string, term = "") => {
    let q = db().from("profiles").select("id,username,display_name,avatar_url,bio,is_verified,last_seen_at")
      .neq("id", uid).order("last_seen_at", { ascending: false }).limit(60);
    if (term.trim()) {
      const clean = term.trim().replace(/[%_,]/g, "");
      q = q.or(`username.ilike.%${clean}%,display_name.ilike.%${clean}%`);
    }
    const { data } = await q;
    setPeople(data ?? []);
  }, []);

  const hydrate = useCallback(async (u: any) => {
    if (!u) { setUser(null); setMe(null); return; }
    setUser(u);
    const fallback = `user-${u.id.replaceAll("-", "").slice(0, 10)}`;
    await db().from("profiles").upsert({
      id: u.id,
      username: u.user_metadata?.username || fallback,
      display_name: u.user_metadata?.display_name || u.email?.split("@")[0] || "Eager user",
      last_seen_at: new Date().toISOString(),
    }, { onConflict: "id" });
    const { data } = await db().from("profiles").select("*").eq("id", u.id).maybeSingle();
    setMe(data);
    await loadPeople(u.id);
  }, [loadPeople]);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => { if (alive) void hydrate(data.user); });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => void hydrate(s?.user ?? null));
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, [hydrate]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`eager-incoming-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "call_sessions", filter: `callee_id=eq.${user.id}` },
        (p) => { const c = p.new as Call; if (c.status === "ringing") setIncoming(c); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "call_sessions", filter: `callee_id=eq.${user.id}` },
        (p) => { const c = p.new as Call; if (c.id === incoming?.id && c.status !== "ringing") setIncoming(null); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, incoming?.id]);

  const auth = async () => {
    setBusy(true); setError(null);
    try {
      if (authMode === "signup") {
        if (!name.trim() || !username.trim()) throw new Error("Enter your name and username.");
        const { data, error: e } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { display_name: name.trim(), username: username.trim() } },
        });
        if (e) throw e;
        if (!data.session) setError("Account created. Confirm your email, then sign in.");
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (e) throw e;
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Authentication failed."); }
    finally { setBusy(false); }
  };

  const call = async (person: Profile, mode: "voice" | "video") => {
    if (!user) return;
    const { data, error: e } = await db().from("call_sessions")
      .insert({ caller_id: user.id, callee_id: person.id, mode, status: "ringing" }).select("*").single();
    if (e) { setError(e.message); return; }
    setRemote(person); setActive(data);
  };

  const answer = async () => {
    if (!incoming || !user) return;
    const { data: p } = await db().from("profiles").select("*").eq("id", incoming.caller_id).maybeSingle();
    await db().from("call_sessions").update({ status: "active", started_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", incoming.id);
    setRemote(p); setActive({ ...incoming, status: "active" }); setIncoming(null);
  };

  const decline = async () => {
    if (!incoming) return;
    await db().from("call_sessions").update({ status: "declined", ended_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", incoming.id);
    setIncoming(null);
  };

  if (!user) return (
    <main className="min-h-screen bg-[#050507] px-5 py-12 text-white">
      <div className="mx-auto max-w-md pt-10">
        <div className="mb-8 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-sky-500"><PhoneCall /></div><div><p className="text-[10px] uppercase tracking-[.3em] text-white/40">Eager</p><h1 className="text-3xl font-black">Connect</h1></div></div>
        <section className="rounded-3xl border border-white/10 bg-white/[.04] p-6 backdrop-blur-xl">
          <div className="mb-4 flex rounded-xl bg-black/30 p-1">{(["login","signup"] as const).map((m) => <button key={m} onClick={() => setAuthMode(m)} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${authMode === m ? "bg-white text-black" : "text-white/50"}`}>{m === "login" ? "Sign in" : "Create account"}</button>)}</div>
          {authMode === "signup" && <><input className="field" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} /><input className="field" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /></>}
          <input className="field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="field" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-200">{error}</p>}
          <button disabled={busy} onClick={() => void auth()} className="mt-4 w-full rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-50">{busy ? "Please wait…" : authMode === "login" ? "Enter Connect" : "Create account"}</button>
          <p className="mt-4 text-center text-[11px] text-white/35">Camera, microphone and screen access are requested only when you start or answer a call.</p>
        </section>
      </div>
      <style>{`.field{margin-top:.75rem;width:100%;border-radius:.75rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);padding:.75rem 1rem;outline:none;color:white}.field::placeholder{color:rgba(255,255,255,.3)}`}</style>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><PhoneCall /></div><div><p className="text-[10px] uppercase tracking-[.3em] text-white/35">Eager Connect</p><h1 className="font-bold">People & calls</h1></div></div>
          <div className="flex items-center gap-2"><Avatar profile={me} /><button onClick={() => void supabase.auth.signOut()} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60">Sign out</button></div>
        </header>
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_330px]">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Call anyone on Eager</h2><p className="mt-1 text-sm text-white/45">Voice, video, screen sharing and in-call chat.</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-[11px] text-emerald-200">● Online</span></div>
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3"><Search className="h-4 w-4 text-white/30" /><input value={search} onChange={(e) => { setSearch(e.target.value); void loadPeople(user.id, e.target.value); }} placeholder="Search name or username…" className="w-full bg-transparent text-sm outline-none" /></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {people.map((p) => <article key={p.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="flex gap-3"><Avatar profile={p} /><div className="min-w-0"><div className="flex items-center gap-1"><h3 className="truncate font-semibold">{p.display_name}</h3>{p.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />}</div><p className="text-xs text-white/35">@{p.username}</p><p className="mt-2 line-clamp-2 text-xs text-white/45">{p.bio || "Available for an Eager call."}</p></div></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => void call(p,"voice")} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs"><AudioLines className="h-4 w-4" /> Voice</button><button onClick={() => void call(p,"video")} className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-black"><Video className="h-4 w-4" /> Video</button></div></article>)}
            </div>
            {!people.length && <div className="mt-5 rounded-2xl border border-dashed border-white/10 py-14 text-center text-sm text-white/35">No other users found.</div>}
          </section>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><div className="flex items-center gap-2"><Users className="h-4 w-4" /><b>Calling toolkit</b></div><ul className="mt-4 space-y-3 text-xs text-white/55"><li>HD voice + video</li><li>Screen + face at the same time</li><li>Mic / camera controls</li><li>In-call messages + reactions</li><li>Authenticated signaling</li></ul></div>
            <button onClick={() => void navigator.clipboard?.writeText(window.location.href)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-xs"><Copy className="h-4 w-4" /> Copy Connect link</button>
          </aside>
        </div>
      </div>

      {incoming && <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur"><div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#111116] p-7 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-400/10"><PhoneCall className="animate-pulse text-emerald-300" /></div><p className="mt-5 text-xs uppercase tracking-[.25em] text-white/35">Incoming {incoming.mode} call</p><h2 className="mt-2 text-2xl font-bold">Someone is calling</h2><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => void decline()} className="rounded-2xl bg-red-500/10 py-3 font-semibold text-red-200">Decline</button><button onClick={() => void answer()} className="rounded-2xl bg-emerald-400 py-3 font-semibold text-black">Answer</button></div></div></div>}
      {active && <CallRoom call={active} meId={user.id} remote={remote} onEnd={() => { setActive(null); setRemote(null); }} />}
    </main>
  );
}

function CallRoom({ call, meId, remote, onEnd }: { call: Call; meId: string; remote: Profile | null; onEnd: () => void }) {
  const local = useRef<HTMLVideoElement>(null), remoteVideo = useRef<HTMLVideoElement>(null), remoteFace = useRef<HTMLVideoElement>(null), remoteScreen = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null), screen = useRef<MediaStream | null>(null), pc = useRef<RTCPeerConnection | null>(null);
  const signal = useRef<any>(null), remoteMedia = useRef(new MediaStream()), remoteScreenMedia = useRef(new MediaStream());
  const [mic, setMic] = useState(true), [cam, setCam] = useState(call.mode === "video"), [sharing, setSharing] = useState(false);
  const [remoteSharing, setRemoteSharing] = useState(false), [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<{text:string;mine:boolean}[]>([]), [message, setMessage] = useState("");
  const [reaction, setReaction] = useState<string | null>(null), [error, setError] = useState<string | null>(null);
  const videoCount = useRef(0);

  const send = useCallback(async (kind: string, payload: any) => {
    await db().from("call_signals").insert({ call_id: call.id, sender_id: meId, kind, payload });
  }, [call.id, meId]);

  useEffect(() => {
    let alive = true;
    const start = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: call.mode === "video" });
        if (!alive) return;
        stream.current = media;
        if (local.current) { local.current.srcObject = media; local.current.muted = true; }
        const connection = new RTCPeerConnection(RTC_CONFIG); pc.current = connection;
        const audio = connection.addTransceiver("audio", { direction: "sendrecv" });
        const camera = connection.addTransceiver("video", { direction: "sendrecv" });
        const screenTx = connection.addTransceiver("video", { direction: "sendrecv" });
        if (media.getAudioTracks()[0]) await audio.sender.replaceTrack(media.getAudioTracks()[0]);
        if (media.getVideoTracks()[0]) await camera.sender.replaceTrack(media.getVideoTracks()[0]);
        connection.onicecandidate = (e) => { if (e.candidate) void send("ice", { candidate: e.candidate.toJSON() }); };
        connection.onconnectionstatechange = () => setConnected(connection.connectionState === "connected");
        connection.ontrack = (e) => {
          if (e.track.kind === "audio") { remoteMedia.current.addTrack(e.track); if (remoteVideo.current) remoteVideo.current.srcObject = remoteMedia.current; return; }
          videoCount.current += 1;
          const target = videoCount.current > 1 ? remoteScreenMedia.current : remoteMedia.current;
          target.addTrack(e.track);
          if (videoCount.current > 1) { if (remoteScreen.current) remoteScreen.current.srcObject = remoteScreenMedia.current; }
          else if (remoteVideo.current) {
            remoteVideo.current.srcObject = remoteMedia.current;
            if (remoteFace.current) remoteFace.current.srcObject = remoteMedia.current;
          }
        };

        const ch = supabase.channel(`eager-call-${call.id}`);
        signal.current = ch;
        ch.on("postgres_changes", { event:"INSERT", schema:"public", table:"call_signals", filter:`call_id=eq.${call.id}` }, async (p) => {
          const s = p.new as Signal; if (s.sender_id === meId) return;
          if (s.kind === "offer" || s.kind === "renegotiate-offer") {
            await connection.setRemoteDescription(s.payload);
            const answer = await connection.createAnswer(); await connection.setLocalDescription(answer);
            await send(s.kind === "offer" ? "answer" : "renegotiate-answer", answer);
          } else if (s.kind === "answer" || s.kind === "renegotiate-answer") await connection.setRemoteDescription(s.payload);
          else if (s.kind === "ice" && s.payload?.candidate) await connection.addIceCandidate(s.payload.candidate).catch(() => undefined);
          else if (s.kind === "screen-start") setRemoteSharing(true);
          else if (s.kind === "screen-stop") setRemoteSharing(false);
          else if (s.kind === "chat") setMessages((m) => [...m, { text: String(s.payload?.text || ""), mine: false }]);
          else if (s.kind === "reaction") { setReaction(String(s.payload?.emoji || "❤️")); window.setTimeout(() => setReaction(null), 1400); }
        }).subscribe(async (status) => {
          if (status !== "SUBSCRIBED") return;
          const { data } = await db().from("call_signals").select("*").eq("call_id", call.id).order("created_at", { ascending: true });
          for (const s of (data || []) as Signal[]) if (s.sender_id !== meId && s.kind === "offer") {
            await connection.setRemoteDescription(s.payload); const answer = await connection.createAnswer(); await connection.setLocalDescription(answer); await send("answer", answer);
          }
          if (call.caller_id === meId) { const offer = await connection.createOffer(); await connection.setLocalDescription(offer); await send("offer", offer); }
        });
      } catch (e) { setError(e instanceof Error ? e.message : "Could not start media."); }
    };
    void start();
    return () => { alive = false; pc.current?.close(); stream.current?.getTracks().forEach((t) => t.stop()); screen.current?.getTracks().forEach((t) => t.stop()); if (signal.current) void supabase.removeChannel(signal.current); };
  }, [call, meId, send]);

  useEffect(() => {
    const ch = supabase.channel(`eager-call-state-${call.id}`).on("postgres_changes", { event:"UPDATE", schema:"public", table:"call_sessions", filter:`id=eq.${call.id}` }, (p) => {
      const status = (p.new as Call).status; if (["ended","declined","missed"].includes(status)) onEnd(); if (status === "active") setConnected(true);
    }).subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [call.id, onEnd]);

  const end = async () => { await db().from("call_sessions").update({ status:"ended", ended_at:new Date().toISOString(), updated_at:new Date().toISOString() }).eq("id", call.id); onEnd(); };
  const toggleMic = () => { const t=stream.current?.getAudioTracks()[0]; if(!t)return; t.enabled=!t.enabled; setMic(t.enabled); };
  const toggleCam = () => { const t=stream.current?.getVideoTracks()[0]; if(!t)return; t.enabled=!t.enabled; setCam(t.enabled); };
  const toggleScreen = async () => {
    const tx = pc.current?.getTransceivers().find((t) => t.receiver.track.kind === "video" && !t.sender.track);
    if (!tx) return;
    if (sharing) { screen.current?.getTracks().forEach((t)=>t.stop()); await tx.sender.replaceTrack(null); setSharing(false); await send("screen-stop", {}); return; }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true }); const t=s.getVideoTracks()[0]; if(!t)return;
      screen.current=s; await tx.sender.replaceTrack(t); t.onended=()=>void toggleScreen(); setSharing(true); await send("screen-start", {});
    } catch (e) { setError(e instanceof Error ? e.message : "Screen sharing was cancelled."); }
  };
  const chat = async () => { const text=message.trim(); if(!text)return; setMessages((m)=>[...m,{text,mine:true}]); setMessage(""); await send("chat",{text}); };
  const react = async (emoji:string) => { setReaction(emoji); window.setTimeout(()=>setReaction(null),1400); await send("reaction",{emoji}); };

  return <div className="fixed inset-0 z-[70] bg-black text-white">
    <div className="relative h-full w-full overflow-hidden">
      {call.mode === "video" ? <video ref={remoteVideo} autoPlay playsInline className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-fuchsia-950/30 to-sky-950/20"><Avatar profile={remote} large /></div>}
      <video ref={remoteScreen} autoPlay playsInline className={`absolute inset-0 h-full w-full bg-black object-contain ${remoteSharing ? "block" : "hidden"}`} />
      {call.mode === "video" && <div className="absolute right-4 top-4 h-36 w-28 overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl sm:h-44 sm:w-32"><video ref={local} autoPlay playsInline muted className="h-full w-full object-cover" /></div>}
      {call.mode === "video" && remoteSharing && <div className="absolute left-4 top-16 h-36 w-28 overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl sm:h-44 sm:w-32"><video ref={remoteFace} autoPlay playsInline className="h-full w-full object-cover" /></div>}
      <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-2 text-xs backdrop-blur"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />{connected ? "Connected" : "Connecting…"}</div>
      {reaction && <div className="absolute left-1/2 top-1/3 -translate-x-1/2 text-6xl drop-shadow-2xl">{reaction}</div>}
      {error && <div className="absolute left-1/2 top-16 max-w-sm -translate-x-1/2 rounded-xl bg-red-500/15 px-4 py-3 text-xs text-red-100">{error}</div>}
      <div className="absolute bottom-24 left-4 max-w-xs space-y-2">{messages.slice(-4).map((m,i)=><div key={i} className={`rounded-2xl px-3 py-2 text-xs ${m.mine ? "ml-8 bg-white text-black" : "mr-8 bg-black/60 text-white"}`}>{m.text}</div>)}</div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-3xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
        <button onClick={toggleMic} className="grid h-11 w-11 place-items-center rounded-full bg-white/10">{mic ? <Mic /> : <MicOff className="text-red-300" />}</button>
        {call.mode === "video" && <button onClick={toggleCam} className="grid h-11 w-11 place-items-center rounded-full bg-white/10">{cam ? <Camera /> : <CameraOff className="text-red-300" />}</button>}
        {call.mode === "video" && <button onClick={()=>void toggleScreen()} className={`grid h-11 w-11 place-items-center rounded-full ${sharing ? "bg-emerald-400 text-black" : "bg-white/10"}`}><MonitorUp /></button>}
        <button onClick={()=>void react("❤️")} className="grid h-11 w-11 place-items-center rounded-full bg-white/10"><Heart /></button>
        <button onClick={()=>void react("👍")} className="grid h-11 w-11 place-items-center rounded-full bg-white/10"><Smile /></button>
        <button onClick={() => void end()} className="grid h-11 w-14 place-items-center rounded-full bg-red-500"><PhoneOff /></button>
      </div>
      <div className="absolute bottom-20 right-4 flex max-w-[calc(100vw-2rem)] gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
        <input value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")void chat()}} placeholder="Message…" className="w-32 bg-transparent px-2 text-xs outline-none sm:w-48" />
        <button onClick={()=>void chat()} className="grid h-9 w-9 place-items-center rounded-xl bg-white text-black"><Check className="h-4 w-4" /></button>
      </div>
    </div>
  </div>;
}
