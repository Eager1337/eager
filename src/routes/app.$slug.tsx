import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Download, Share2, Smartphone } from "lucide-react";

import { getPublishedBuild } from "../lib/site-builder.functions";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice?: Promise<unknown> };

export const Route = createFileRoute("/app/$slug")({
  loader: async ({ params }) => {
    const { build } = await getPublishedBuild({ data: { slug: params.slug, kind: "app" } });
    if (!build) throw notFound();
    return { build, slug: params.slug };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.build?.name ?? "Installable app";
    const slug = loaderData?.slug ?? "";
    const theme = loaderData?.build?.theme_color ?? "#0A0A0A";
    return {
      meta: [
        { title: `${name}, installable app` },
        {
          name: "description",
          content:
            loaderData?.build?.summary ||
            `${name}, an installable app built in the Eager Beaver app builder. Install it on Android or desktop in one tap.`,
        },
        { property: "og:title", content: `${name}, installable app` },
        { property: "og:description", content: `Install ${name} on your phone or desktop, no app store needed.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "theme-color", content: theme },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-title", content: loaderData?.build?.short_name ?? name },
      ],
      links: slug ? [{ rel: "manifest", href: `/api/public/appmanifest/${slug}` }] : [],
    };
  },
  component: InstallableApp;
});

function InstallableApp() {
  const { build, slug } = Route.useLoaderData();
  const [installEvent, setInstallEvent] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: build.name, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => undefined);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <iframe
        title={build.name}
        src={`/api/public/appdoc/${slug}`}
        className="h-full w-full border-0 bg-white"
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
      />

      {!installed ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-black/85 px-3 py-2 backdrop-blur">
            <span className="hidden truncate px-1 text-xs text-white/70 sm:block">{build.name}</span>
            {installEvent ? (
              <button
                onClick={() => void installEvent.prompt()}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black"
              >
                <Smartphone className="h-4 w-4" /> Install app
              </button>
            ) : (
              <span className="px-1 text-[11px] text-white/55">
                Use your browser menu, then Add to Home screen or Install.
              </span>
            )}
            {build.apk_url ? (
              <a
                href={build.apk_url}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 px-3 text-xs text-white"
              >
                <Download className="h-4 w-4" /> APK
              </a>
            ) : null}
            <button
              onClick={() => void share()}
              aria-label="Share this app"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 text-white"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
