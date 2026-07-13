import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { supabase } from "../integrations/supabase/client";

// All portfolio image pointers, so we can reverse-map a built-in asset URL back
// to its logical filename ("key") and swap in an admin-uploaded override.
import audi from "../assets/audi-nuvolari.jpg.asset.json";
import basketball from "../assets/basketball-ring.png.asset.json";
import superman from "../assets/superman.jpg.asset.json";
import deadpool from "../assets/deadpool-wolverine.jpg.asset.json";
import saitama from "../assets/saitama.png.asset.json";
import onePiece from "../assets/one-piece-cast.png.asset.json";
import love from "../assets/love-train.png.asset.json";
import spider from "../assets/spider-verse.png.asset.json";
import luffy from "../assets/luffy-fire.png.asset.json";
import nba from "../assets/nba-2k25.png.asset.json";
import portraitRed from "../assets/portrait-red.jpg.asset.json";
import portraitBlackSit from "../assets/portrait-black-sitting.jpg.asset.json";
import portraitBlackStand from "../assets/portrait-black-standing.jpg.asset.json";
import toonRedFull from "../assets/toon-red-full.png.asset.json";
import toonRedJacket from "../assets/toon-red-jacket.png.asset.json";
import toonPink from "../assets/toon-pink.png.asset.json";
import eagerPortrait from "../assets/eager-beaver-portrait.png.asset.json";

type Pointer = { url: string; original_filename: string };

export const ASSET_POINTERS: Pointer[] = [
  audi,
  basketball,
  superman,
  deadpool,
  saitama,
  onePiece,
  love,
  spider,
  luffy,
  nba,
  portraitRed,
  portraitBlackSit,
  portraitBlackStand,
  toonRedFull,
  toonRedJacket,
  toonPink,
  eagerPortrait,
];

// url -> filename ("key")
const URL_TO_KEY: Record<string, string> = {};
for (const p of ASSET_POINTERS) URL_TO_KEY[p.url] = p.original_filename;

/* ---------------- override store (admin-uploaded images) ---------------- */

let cache: Record<string, string> = {};
let loaded = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function loadOverrides() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data } = await supabase.from("portfolio_assets").select("key, url");
      const next: Record<string, string> = {};
      for (const row of data ?? []) next[row.key] = row.url;
      cache = next;
    } catch {
      /* ignore, fall back to built-in urls */
    }
    loaded = true;
    notify();
  })();
  return inflight;
}

/** React hook: returns the current key -> override-url map, loading it once. */
export function useAssetOverrides(): Record<string, string> {
  const [, force] = useState(0);
  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    listeners.add(rerender);
    if (!loaded) loadOverrides();
    return () => {
      listeners.delete(rerender);
    };
  }, []);
  return cache;
}

/** Force a refresh of the override cache (call after admin upload/delete). */
export function refreshAssetOverrides() {
  loaded = false;
  inflight = null;
  return loadOverrides();
}

/** Resolve any asset URL to an override when one exists. */
export function resolveAssetUrl(src: string, overrides: Record<string, string>): string {
  const key = URL_TO_KEY[src];
  if (key && overrides[key]) return overrides[key];
  return src;
}

/* ---------------- branded placeholder ---------------- */

function placeholderFor(label: string): string {
  const text = (label || "image").replace(/[<>&]/g, "").slice(0, 22);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#1a0b2e'/>
        <stop offset='0.5' stop-color='#2a1040'/>
        <stop offset='1' stop-color='#0b0620'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <text x='50%' y='46%' fill='#a855f7' font-family='sans-serif' font-size='42' font-weight='800' text-anchor='middle'>Eager Beaver</text>
    <text x='50%' y='56%' fill='rgba(255,255,255,0.55)' font-family='sans-serif' font-size='22' text-anchor='middle'>${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ---------------- resilient image component ---------------- */

type SmartImageProps = ImgHTMLAttributes<HTMLImageElement> & { src: string };

/**
 * Drop-in <img> that (1) swaps in an admin-uploaded override when available and
 * (2) shows a branded placeholder instead of a broken icon if the source fails.
 */
export function SmartImage({ src, alt, ...rest }: SmartImageProps) {
  const overrides = useAssetOverrides();
  const resolved = resolveAssetUrl(src, overrides);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  return (
    <img
      src={failed ? placeholderFor(String(alt ?? "")) : resolved}
      alt={alt}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
