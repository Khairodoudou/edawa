"use client";

import { useEffect, useState, useCallback } from "react";

interface PWAState {
  /** Is the app currently installable? */
  isInstallable: boolean;
  /** Is the app already installed as PWA? */
  isInstalled: boolean;
  /** Is there a SW update available? */
  hasUpdate: boolean;
  /** Is the device currently online? */
  isOnline: boolean;
  /** The platform (ios, android, desktop, unknown) */
  platform: "ios" | "android" | "desktop" | "unknown";
  /** Trigger the install prompt */
  installApp: () => Promise<boolean>;
  /** Apply the available update */
  applyUpdate: () => void;
  /** Dismiss the update notification */
  dismissUpdate: () => void;
}

export function usePWA(): PWAState {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  const platform = detectPlatform();

  // Detect platform
  function detectPlatform(): "ios" | "android" | "desktop" | "unknown" {
    if (typeof window === "undefined") return "unknown";
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    if (/windows|macintosh|linux/.test(ua)) return "desktop";
    return "unknown";
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ─── Online/Offline ───
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // ─── Check if already installed ───
    const mql = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(
      mql.matches || (navigator as unknown as Record<string, unknown>).standalone === true
    );
    const handleDisplayChange = (e: MediaQueryListEvent) =>
      setIsInstalled(e.matches);
    mql.addEventListener("change", handleDisplayChange);

    // ─── Install prompt (Android/Desktop Chrome) ───
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.__deferredInstallPrompt) {
      setDeferredPrompt(win.__deferredInstallPrompt);
      setIsInstallable(true);
    }

    const handlePromptAvailable = () => {
      if (win.__deferredInstallPrompt) {
        setDeferredPrompt(win.__deferredInstallPrompt);
        setIsInstallable(true);
      }
    };
    window.addEventListener("pwa-prompt-available", handlePromptAvailable);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      win.__deferredInstallPrompt = e;
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // ─── App installed ───
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      win.__deferredInstallPrompt = null;
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // ─── Register Service Worker ───
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Check for updates periodically
          setInterval(
            () => {
              registration.update();
            },
            60 * 60 * 1000
          ); // Every hour

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setWaitingWorker(newWorker);
                setHasUpdate(true);
              }
            });
          });
        })
        .catch((err) => {
          console.warn("SW registration failed:", err);
        });

      // Handle controller change (reload on update)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mql.removeEventListener("change", handleDisplayChange);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompt =
      deferredPrompt ||
      (typeof window !== "undefined"
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__deferredInstallPrompt
        : null);
    if (!prompt) return false;
    try {
      prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__deferredInstallPrompt = null;
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setHasUpdate(false);
    }
  }, [waitingWorker]);

  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
  }, []);

  return {
    isInstallable,
    isInstalled,
    hasUpdate,
    isOnline,
    platform,
    installApp,
    applyUpdate,
    dismissUpdate,
  };
}
