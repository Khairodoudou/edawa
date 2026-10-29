/// <reference lib="webworker" />

// ─── Service Worker — دوائي PWA ───
// Caching strategy: Network-first for API/auth, Cache-first for static assets

const SW_VERSION = "1.0.0";
const CACHE_PREFIX = "edawa";
const STATIC_CACHE = `${CACHE_PREFIX}-static-v${SW_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v${SW_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_URLS: string[] = [
  "/",
  "/offline",
  "/manifest.json",
  "/logo.png",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Paths that should NEVER be cached (sensitive / auth)
const NEVER_CACHE_PATTERNS = [
  /\/api\/auth/,
  /\/api\/admin/,
  /\/pharmacist\/login/,
  /\/pharmacist\/dashboard/,
  /\/admin/,
  /\/_next\/webpack-hmr/,
];

// Paths to cache with network-first strategy
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/search/,
];

declare const self: ServiceWorkerGlobalScope;

// ─── Install: pre-cache critical assets ───
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: clean old caches, claim clients ───
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== STATIC_CACHE &&
                key !== RUNTIME_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: routing strategies ───
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension, blob, etc.
  if (!url.protocol.startsWith("http")) return;

  // Skip dev tools / HMR in development
  if (url.pathname.includes("_next/webpack-hmr")) return;

  // NEVER cache sensitive routes — always go to network
  if (NEVER_CACHE_PATTERNS.some((p) => p.test(url.pathname))) return;

  // Network-first for API and search
  if (NETWORK_FIRST_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets (_next/static, icons, images)
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|ttf|css|js)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale-while-revalidate for navigation (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

// ─── Strategies ───

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408, statusText: "Offline" });
  }
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function networkFirstWithOffline(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Serve offline page
    const offlinePage = await caches.match("/offline");
    if (offlinePage) return offlinePage;
    return new Response("غير متصل بالإنترنت", {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

// ─── Message handling for update prompt ───
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
