import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

// Tenant sites are served from <slug>.eager.app and rendered by /site/$slug.
// Vercel normally provides this rewrite via vercel.json, but the Build Output
// API bundle that Nitro produces defines its own routing, so the rewrite is
// applied here as well — inside the app. That keeps tenant domains working on
// every platform (Vercel, Lovable/Cloudflare, local dev) with zero platform
// config. Mirrors vercel.json: any path on the tenant host serves the site
// page, query string preserved. `www` and the apex domain are excluded.
const TENANT_HOST_RE = /^([a-z0-9-]+)\.eager\.app$/i;

function rewriteTenantHost(request: Request): Request {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const match = TENANT_HOST_RE.exec(host);
  if (!match || match[1].toLowerCase() === "www") return request;
  const url = new URL(request.url);
  url.pathname = `/site/${match[1].toLowerCase()}`;
  return new Request(url, request);
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"}, try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(rewriteTenantHost(request), env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
