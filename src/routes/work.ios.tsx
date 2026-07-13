import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { IOSFlightTracker } from "@/components/templates/IOSFlightTracker";
import { IOSNotifications } from "@/components/templates/IOSNotifications";
import { IOSMessages } from "@/components/templates/IOSMessages";

export const Route = createFileRoute("/work/ios")({
  head: () => ({
    meta: [
      { title: "iOS template trio, Eager Beaver" },
      { name: "description", content: "Animated iOS templates: flight tracker, push notifications and iMessage conversation." },
      { property: "og:title", content: "iOS template trio, Eager Beaver" },
      { property: "og:description", content: "Flight tracker, push notifications and iMessage UI demos." },
    ],
  }),
  component: IOSShowcase,
});

function IOSShowcase() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white antialiased">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0C0C0C]/70 border-b border-white/5">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-8 py-4">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back to portfolio
          </Link>
          <span className="text-xs uppercase tracking-[0.3em] text-[#E63946]">iOS templates</span>
        </div>
      </header>

      <section className="px-5 sm:px-8 pt-16 pb-10 mx-auto max-w-7xl">
        <h1 className="font-[Anton,sans-serif] uppercase text-5xl sm:text-7xl leading-[0.9]">
          iOS template<br /><span className="text-[#E63946]">trio.</span>
        </h1>
        <p className="mt-6 max-w-xl text-white/70">
          Three drop-in components for travel, messaging and notification demos, animated, reusable and built to embed in product reels.
        </p>
      </section>

      <section className="px-5 sm:px-8 pb-24 mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Flight Tracker", body: "Route visualization with real-time-style data.", node: <IOSFlightTracker /> },
          { title: "Notifications", body: "Sequential push notifications appearing on the lockscreen.", node: <IOSNotifications /> },
          { title: "iMessage", body: "Realistic chat-bubble conversation sequence.", node: <IOSMessages /> },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-white/10 bg-[#141414] p-6 flex flex-col items-center">
            <div className="w-full flex justify-center">{card.node}</div>
            <h2 className="mt-6 font-[Anton,sans-serif] uppercase text-2xl tracking-wide">{card.title}</h2>
            <p className="mt-2 text-sm text-white/60 text-center">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
