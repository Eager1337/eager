import { getRequestIP } from "@tanstack/react-start/server";

/** Server-side, database-backed rate limiting. Raw identifiers are hashed before persistence. */
export async function enforceRateLimit(
  scope: string,
  extraKey: string,
  limit: number,
  windowSeconds: number,
  blockSeconds = windowSeconds,
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = (getRequestIP({ xForwardedFor: true }) || "unknown").trim();
  const material = scope + "|" + ip + "|" + extraKey;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));
  const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const { data, error } = await (supabaseAdmin as any).rpc("consume_rate_limit", {
    p_key: scope + ":" + hash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
    p_block_seconds: blockSeconds,
  });
  if (error) {
    if (scope.startsWith("admin-")) throw new Error("Rate limiter unavailable.");
    return { allowed: true, retryAfterSeconds: 0 };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { allowed: Boolean(row?.allowed), retryAfterSeconds: Number(row?.retry_after_seconds ?? 0) };
}
