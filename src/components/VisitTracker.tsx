import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { recordVisit } from "../lib/workspace.functions";

const SESSION_KEY = "toonhub:visit-session";
const SEEN_KEY = "toonhub:visited-before";

function detect(ua: string) {
  const mobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(ua);
  const tablet = /iPad|Tablet/i.test(ua);
  const device = tablet ? "Tablet" : mobile ? "Mobile" : "Desktop";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : /Firefox\//.test(ua)
            ? "Firefox"
            : "Other";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iPod/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}

/** Records one row per page view so the owner can see every visitor in /admin. */
export function VisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const send = useServerFn(recordVisit);
  const lastSent = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/admin")) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    let sessionId = "";
    try {
      sessionId = sessionStorage.getItem(SESSION_KEY) ?? "";
      if (!sessionId) {
        sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem(SESSION_KEY, sessionId);
      }
    } catch {
      sessionId = "anon";
    }

    let isReturning = false;
    try {
      isReturning = localStorage.getItem(SEEN_KEY) === "1";
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked */
    }

    const ua = navigator.userAgent;
    const { device, browser, os } = detect(ua);

    void send({
      data: {
        sessionId,
        path: pathname,
        referrer: document.referrer || "",
        device,
        browser,
        os,
        language: navigator.language || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        screen: `${window.screen.width}x${window.screen.height}`,
        isReturning,
        userAgent: ua.slice(0, 600),
      },
    }).catch(() => {
      /* analytics must never break the page */
    });
  }, [pathname, send]);

  return null;
}
