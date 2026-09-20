/**
 * Server-only AI provider selection.
 *
 * Inside Lovable, LOVABLE_API_KEY is injected automatically and the AI
 * workspace talks to Lovable's gateway. That key is a Lovable-managed secret
 * and cannot be exported, so on Vercel (or any self-deployed host) the same
 * features run against the OpenAI API with your own OPENAI_API_KEY instead.
 * Both gateways speak the same wire format (Responses API + Images API), so
 * the calling code stays identical.
 *
 * Resolution order:
 *   1. LOVABLE_API_KEY  -> https://ai.gateway.lovable.dev (Lovable models)
 *   2. OPENAI_API_KEY   -> https://api.openai.com (your own billing)
 *
 * Model names can be overridden with AI_TEXT_MODEL / AI_IMAGE_MODEL without
 * touching code. The text default must support the Responses API with
 * `reasoning: { effort, summary }` (gpt-5 family and o-series do).
 */

export type AiEndpoint = {
  url: string;
  headers: Record<string, string>;
  model: string;
};

export type AiProvider = {
  provider: "lovable" | "openai";
  chat: AiEndpoint;
  image: AiEndpoint;
};

const DEFAULT_LOVABLE_TEXT_MODEL = "openai/gpt-5.6-sol";
const DEFAULT_LOVABLE_IMAGE_MODEL = "openai/gpt-image-1-mini";
const DEFAULT_OPENAI_TEXT_MODEL = "gpt-5.2";
const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-1-mini";

/** Which reasoning models accept the `reasoning` parameter. */
export function supportsReasoning(model: string): boolean {
  return /^(gpt-5|o\d)/i.test(model);
}

export function getAiProvider(): AiProvider | null {
  const lovable = process.env.LOVABLE_API_KEY;
  if (lovable) {
    return {
      provider: "lovable",
      chat: {
        url: "https://ai.gateway.lovable.dev/v1/responses",
        headers: { "Lovable-API-Key": lovable, "X-Lovable-AIG-SDK": "fetch" },
        model: process.env.AI_TEXT_MODEL?.trim() || DEFAULT_LOVABLE_TEXT_MODEL,
      },
      image: {
        url: "https://ai.gateway.lovable.dev/v1/images/generations",
        headers: { Authorization: `Bearer ${lovable}` },
        model: process.env.AI_IMAGE_MODEL?.trim() || DEFAULT_LOVABLE_IMAGE_MODEL,
      },
    };
  }

  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    return {
      provider: "openai",
      chat: {
        url: "https://api.openai.com/v1/responses",
        headers: { Authorization: `Bearer ${openai}` },
        model: process.env.AI_TEXT_MODEL?.trim() || DEFAULT_OPENAI_TEXT_MODEL,
      },
      image: {
        url: "https://api.openai.com/v1/images/generations",
        headers: { Authorization: `Bearer ${openai}` },
        model: process.env.AI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_IMAGE_MODEL,
      },
    };
  }

  return null;
}
