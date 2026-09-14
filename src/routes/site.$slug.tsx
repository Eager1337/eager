import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublishedSite } from "../lib/site-builder.functions";

export const Route = createFileRoute("/site/$slug")({
  loader: async ({ params }) => {
    const { site } = await getPublishedSite({ data: { slug: params.slug } });
    if (!site) throw notFound();
    return { site };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.site?.name ?? "Generated site";
    return { meta: [
      { title: `${name} | Eager Beaver` },
      { name: "description", content: `${name}, published from the Eager Beaver AI Website Builder.` },
      { property: "og:title", content: `${name} | Eager Beaver` },
      { property: "og:description", content: `Explore ${name}, an AI-built website published by Eager Beaver.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: PublishedSite,
});

function PublishedSite() {
  const { site } = Route.useLoaderData();
  const [welcome, setWelcome] = useState(true);

  useEffect(() => {
    try { setWelcome(sessionStorage.getItem(`eb-welcome-${site.name}`) !== "1"); } catch { setWelcome(true); }
  }, [site.name]);

  const enter = () => {
    try { sessionStorage.setItem(`eb-welcome-${site.name}`, "1"); } catch { /* ignore */ }
    setWelcome(false);
  };

  return <main className="relative h-screen w-screen overflow-hidden bg-black">
    <iframe title={site.name} srcDoc={site.html} className="h-full w-full border-0" sandbox="allow-scripts allow-popups allow-forms allow-modals" />
    {welcome ? <div className="absolute inset-0 z-10 grid place-items-center bg-black/70 p-5 backdrop-blur-md">
      <section className="w-full max-w-md rounded-3xl border border-white/15 bg-neutral-950/95 p-8 text-center text-white shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-sky-500 text-xl font-black">EB</div>
        <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">Welcome</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{site.name}</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">Welcome to this website. Thanks for visiting.</p>
        <button onClick={enter} className="mt-6 min-h-11 rounded-xl bg-white px-6 text-sm font-bold text-black hover:bg-white/90">Enter website</button>
      </section>
    </div> : null}
  </main>;
}
