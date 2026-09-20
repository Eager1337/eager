import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutLayout,
});

const ABOUT_NAV: { to: string; label: string; exact?: boolean }[] = [
  { to: "/about", label: "Overview", exact: true },
  { to: "/about/story", label: "My story" },
  { to: "/about/values", label: "How I work" },
  { to: "/about/education", label: "Education" },
  { to: "/about/beyond-code", label: "Beyond the code" },
];

/** Shared shell for the About section: a slim section nav above every page. */
function AboutLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav
        aria-label="About section"
        className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 sm:px-8">
          <span className="mr-3 shrink-0 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            About
          </span>
          {ABOUT_NAV.map((item) => {
            const active = item.exact
              ? pathname === "/about" || pathname === "/about/"
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[44px] shrink-0 items-center rounded-lg px-3 text-sm transition ${
                  active
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
