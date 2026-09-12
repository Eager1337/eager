import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowUpRight, Download, Smartphone } from "lucide-react";

import { listShowcaseApps } from "../lib/site-builder.functions";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "Installable apps built by Eager Beaver" },
      {
        name: "description",
        content:
          "Install apps built in the Eager Beaver app builder straight to your Android phone or desktop, or download the Android APK where one is available.",
      },
      { property: "og:title", content: "Installable apps by Eager Beaver" },
      {
        property: "og:description",
        content: "Phone-first apps you can install in one tap, no app store needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppsPage,
});

function AppsPage() {
  const list = useServerFn(listShowcaseApps);
  const { data, isPending, isError } = useQuery({
    queryKey: ["showcase-apps"],
    queryFn: () => list({}),
  });
  const apps = data?.apps ?? [];

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-5 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to the portfolio
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Installable apps</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-white/55">
              Every app published from the builder shows up here. Open one and install it on Android or
              desktop in a single tap, or grab the Android APK when one has been attached.
            </p>
          </div>
        </div>

        {isError ? (
          <p className="mt-12 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-sm text-red-200">
            The app list could not be loaded. Refresh the page to try again.
          </p>
        ) : null}

        {isPending ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
            ))}
          </div>
        ) : apps.length ? (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <li
                key={app.slug}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10"
                    style={{ background: app.themeColor }}
                  >
                    {app.icon ? (
                      <img src={app.icon} alt={`${app.name} icon`} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <Smartphone className="h-5 w-5 text-white/70" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{app.name}</h2>
                    <p className="text-[11px] text-white/40">{app.shortName}</p>
                  </div>
                </div>
                <p className="line-clamp-3 text-xs leading-relaxed text-white/55">
                  {app.summary || "A phone-first app you can install on Android or desktop."}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <a
                    href={`/app/${app.slug}`}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-black hover:bg-white/90"
                  >
                    Open and install <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  {app.apkUrl ? (
                    <a
                      href={app.apkUrl}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
                    >
                      <Download className="h-3.5 w-3.5" /> APK
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-sm text-white/50">
            No apps published yet. Build one in the dashboard app builder and publish it to see it here.
          </p>
        )}
      </div>
    </main>
  );
}
