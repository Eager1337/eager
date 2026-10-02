import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CommandPalette } from "../components/portfolio-os/CommandPalette";
import { GlobalSiteTools } from "../components/GlobalSiteTools";
import { VisitTracker } from "../components/VisitTracker";
import { WelcomeCapture } from "../components/WelcomeCapture";
import { PortfolioOsSettingsProvider, bumpSession } from "../lib/portfolio-os-settings";
import { registerPortfolioOsSw } from "../lib/register-sw";
import { ContentStoreProvider } from "../lib/content-store";
import { InvestorModeProvider } from "../lib/investor-mode";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  // Self-heal transient failures (network blips, server restarts): retry quietly
  // up to 3 times per page before leaving the manual "Try again" card on screen.
  useEffect(() => {
    try {
      const key = "eb-auto-retry:" + window.location.pathname;
      const n = Number(sessionStorage.getItem(key) || "0");
      if (n >= 3) {
        const t = setTimeout(() => sessionStorage.removeItem(key), 30000);
        return () => clearTimeout(t);
      }
      sessionStorage.setItem(key, String(n + 1));
      const t = setTimeout(() => {
        router.invalidate();
        reset();
      }, 1500 * (n + 1));
      return () => clearTimeout(t);
    } catch {
      return undefined;
    }
  }, [router, reset]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EAGER-HUB" },
      { name: "description", content: "MY PORTFOLIO" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "EAGER-HUB" },
      { property: "og:description", content: "MY PORTFOLIO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "EAGER-HUB" },
      { name: "twitter:description", content: "MY PORTFOLIO" },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/02c07f08-8caf-4d55-9b9e-6a247d529a58/id-preview-8382bdc8--1de7e9b1-145d-4226-af15-d4f656f5d361.lovable.app-1781745802966.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/02c07f08-8caf-4d55-9b9e-6a247d529a58/id-preview-8382bdc8--1de7e9b1-145d-4226-af15-d4f656f5d361.lovable.app-1781745802966.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700&family=Kanit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,400;1,500;1,600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    bumpSession();
    registerPortfolioOsSw();
    // Page rendered successfully: clear any auto-retry counters.
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k?.startsWith("eb-auto-retry:")) sessionStorage.removeItem(k);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PortfolioOsSettingsProvider>
        <ContentStoreProvider>
          <InvestorModeProvider>
            <MotionConfig reducedMotion="user">
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
              <CommandPalette />
              <GlobalSiteTools />
              <VisitTracker />
              <WelcomeCapture />
            </MotionConfig>
          </InvestorModeProvider>
        </ContentStoreProvider>
      </PortfolioOsSettingsProvider>
    </QueryClientProvider>
  );
}
