import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export const Route = createFileRoute("/skyelite")({
  head: () => ({
    meta: [
      { title: "SkyElite, Private Jet Charter" },
      { name: "description", content: "Premium private jet charter. Fly on your own terms with SkyElite." },
      { property: "og:title", content: "SkyElite, Private Jet Charter" },
      { property: "og:description", content: "Premium private jet charter." },
    ],
  }),
  component: SkyEliteLayout,
});

const NAV: { to: string; label: string; exact?: boolean }[] = [
  { to: "/skyelite", label: "Start", exact: true },
  { to: "/skyelite/story", label: "Story" },
  { to: "/skyelite/rates", label: "Rates" },
  { to: "/skyelite/benefits", label: "Benefits" },
  { to: "/skyelite/faq", label: "FAQ" },
];

function SkyEliteLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduce = useReducedMotion();
  useEffect(() => setOpen(false), [pathname]);

  const handleEscape = useCallback(() => setOpen(false), []);
  const overlayRef = useFocusTrap<HTMLDivElement>(open, handleEscape);

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white font-[Inter,sans-serif] antialiased">
      {/* Liquid-glass nav */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(95vw,1100px)]">
        <div className="relative flex items-center justify-between rounded-full border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <Link to="/skyelite" className="flex items-center gap-2 font-semibold tracking-wide" aria-label="SkyElite home">
            <span className="text-lg">✈ SkyElite</span>
          </Link>
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact }}
                className="px-3 py-1.5 rounded-full text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors data-[status=active]:bg-white data-[status=active]:text-black"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/skyelite/book"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black hover:bg-white/90 transition"
            >
              Book Now <ArrowUpRight className="w-4 h-4" aria-hidden />
            </Link>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="skyelite-mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {open ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              id="skyelite-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              ref={overlayRef}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.18 }}
              className="md:hidden mt-2 rounded-3xl border border-white/15 bg-[#0A0F1A]/95 backdrop-blur-xl p-4"
            >
              <div className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    activeOptions={{ exact: n.exact }}
                    className="px-4 py-2 rounded-xl text-sm text-white/85 hover:bg-white/10 data-[status=active]:bg-white data-[status=active]:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  to="/skyelite/book"
                  className="mt-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 text-xs text-white/50 flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} SkyElite</span>
        <span>Fly on your own terms.</span>
      </footer>
    </div>
  );
}
