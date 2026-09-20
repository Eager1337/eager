// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      // Dev server only: allow sandbox/browser-preview hosts (e.g. Arena's
      // *.e2b.app proxy) and tenant domains (*.eager.app, for local testing
      // with a hosts-file entry). No effect on production builds or Vercel.
      allowedHosts: [".e2b.app", ".eager.app"],
    },
  },
  nitro: {
    // Deploy target for every build that runs OUTSIDE the Lovable editor
    // (Vercel CI, local `bun run build`, GitHub Actions). Lovable's own
    // builds always pin cloudflare-module themselves, so this never affects
    // the Lovable preview/publish flow.
    //
    // The vercel preset emits a Build Output API bundle into .vercel/output
    // (serverless function + static assets + routing config). Vercel picks
    // it up automatically when the GitHub repo is imported — no framework
    // settings need to change.
    preset: "vercel",
  },
});
