// Admin security gate helpers: security questions + intruder photo capture.
// Persistence now lives in Lovable Cloud (see src/lib/security.functions.ts);
// this module only handles the browser-side pieces (camera, metadata).

/* ---------------- Security questions ---------------- */

export type SecurityQuestion = { id: string; question: string; answer: string };

// Owner-known answers. Comparison is case-insensitive and trimmed.
export const SECURITY_QUESTIONS: SecurityQuestion[] = [
  { id: "q1", question: "What is the owner's studio codename?", answer: "eager beaver" },
  { id: "q2", question: "What year did the owner start coding?", answer: "2019" },
];

export function checkSecurityAnswers(answers: Record<string, string>): boolean {
  return SECURITY_QUESTIONS.every(
    (q) => (answers[q.id] ?? "").trim().toLowerCase() === q.answer.trim().toLowerCase(),
  );
}

/* ---------------- Device identifier ---------------- */

const DEVICE_KEY = "portfolio-device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export type ClientMeta = {
  userAgent: string;
  language: string;
  platform: string;
  screen: string;
  timezone: string;
};

export function gatherClientMeta(): ClientMeta {
  if (typeof navigator === "undefined") {
    return { userAgent: "", language: "", platform: "", screen: "", timezone: "" };
  }
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: (navigator as Navigator & { platform?: string }).platform ?? "",
    screen: typeof window !== "undefined" ? `${window.screen.width}×${window.screen.height}` : "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
  };
}

/* ---------------- Geolocation capture ---------------- */

export type GeoResult = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  locationLabel: string;
};

// Ask the browser for the visitor's location. The browser always shows its own
// permission prompt, a website cannot bypass this. Resolves with nulls if the
// visitor denies access or geolocation is unavailable.
export async function requestLocation(): Promise<GeoResult> {
  const empty: GeoResult = { latitude: null, longitude: null, accuracy: null, locationLabel: "" };
  if (typeof navigator === "undefined" || !navigator.geolocation) return empty;
  return new Promise<GeoResult>((resolve) => {
    let settled = false;
    const done = (r: GeoResult) => {
      if (!settled) {
        settled = true;
        resolve(r);
      }
    };
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        done({
          latitude,
          longitude,
          accuracy: accuracy ?? null,
          locationLabel: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        });
      },
      () => done(empty),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
    // Safety timeout in case the callback never fires.
    setTimeout(() => done(empty), 9000);
  });
}

/* ---------------- Camera capture ---------------- */

let sharedStream: MediaStream | null = null;

// Request camera access up front so the browser shows the permission prompt as
// soon as the admin panel opens.
export async function requestCamera(): Promise<MediaStream | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return null;
  if (sharedStream) return sharedStream;
  try {
    sharedStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    return sharedStream;
  } catch {
    return null;
  }
}

export function stopCamera() {
  sharedStream?.getTracks().forEach((t) => t.stop());
  sharedStream = null;
}

// Grab a single frame from the shared stream and return it as a JPEG dataURL.
export async function capturePhoto(): Promise<string | null> {
  const stream = sharedStream ?? (await requestCamera());
  if (!stream) return null;
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    // let the sensor warm up for a stable frame
    await new Promise((r) => setTimeout(r, 350));
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    video.pause();
    video.srcObject = null;
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}
