/**
 * sw.js — Service Worker for Earth's Climate Exhibition
 * ─────────────────────────────────────────────────────────────────
 * Strategy: Cache-first for all local assets, with network fallback.
 *
 * How it works:
 *  1. On install  — pre-cache every file listed in CACHE_FILES.
 *  2. On activate — delete any caches from older versions of this SW.
 *  3. On fetch    — serve from cache instantly; fall back to network
 *                   if the file is not cached yet.
 *
 * This means:
 *  - After the first online visit, the site works with no internet.
 *  - Updating the CACHE_VERSION string forces a fresh download of
 *    all assets on next visit.
 *
 * Scope: this SW controls only the climate-exhibition/ folder
 * (set by the registration in index.html).
 * ─────────────────────────────────────────────────────────────────
 */

"use strict";

/* ── VERSION ────────────────────────────────────────────────────────
 * Bump this string whenever you deploy an update.
 * The old cache will be deleted and all files re-downloaded.
 * Example: "v1" → "v2" after adding slide content.
 * ─────────────────────────────────────────────────────────────────*/
var CACHE_VERSION = "climate-v12";

/* ── FILES TO PRE-CACHE ─────────────────────────────────────────────
 * List every file the site needs to work offline.
 * Paths are relative to the SW's location (climate-exhibition/).
 *
 * /* climate-v11: all 7 media files with clean names */
var CACHE_FILES = [
  "./index.html",
  "./css/variables.css",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./js/main.js",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.svg",
  "./assets/icons/icon-512.svg",
  "./data/nasa-gistemp-global-annual.csv",
  "./data/media-manifest.json",
  "./assets/images/global-energy-budget.jpg",
  "./assets/images/manabe.jpg",
  "./assets/images/hasselmann.jpg",
  "./assets/images/extreme-weather-events.jpg",
  "./assets/videos/climate-spiral.mp4",
  "./assets/videos/greenhouse-effect.mp4",
  "./assets/videos/climate-change.mp4"
];

/* ── INSTALL ────────────────────────────────────────────────────────
 * Pre-cache all listed files.
 * waitUntil() keeps the SW in the installing state until caching
 * is complete; if any file fails to cache, the install fails
 * cleanly (no broken partial cache).
 * ─────────────────────────────────────────────────────────────────*/
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    }).then(function() {
      // Skip waiting so the new SW takes over immediately
      // (safe here because we bump the version on every update)
      return self.skipWaiting();
    })
  );
});

/* ── ACTIVATE ───────────────────────────────────────────────────────
 * Delete all caches that do NOT match the current CACHE_VERSION.
 * This cleans up old versions left by previous deployments.
 * ─────────────────────────────────────────────────────────────────*/
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_VERSION; })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      // Claim all open clients so they switch to this SW immediately
      return self.clients.claim();
    })
  );
});

/* ── FETCH ──────────────────────────────────────────────────────────
 * Cache-first strategy:
 *  1. Try the cache.
 *  2. If not cached, try the network and cache the response for next time.
 *  3. If both fail (truly offline and not cached), return a minimal
 *     offline fallback response so the browser does not show an error page.
 *
 * We only handle GET requests; non-GET (POST, etc.) go straight to network.
 * ─────────────────────────────────────────────────────────────────*/
self.addEventListener("fetch", function(event) {
  // Only intercept GET requests
  if (event.request.method !== "GET") return;

  // Do not intercept requests to other origins
  var requestURL = new URL(event.request.url);
  if (requestURL.origin !== location.origin &&
      event.request.url.indexOf("file://") === -1) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Cache hit — return instantly
        return cachedResponse;
      }

      // Not in cache — try network
      return fetch(event.request).then(function(networkResponse) {
        // Cache successful network responses for future offline use
        if (networkResponse && networkResponse.status === 200) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        // Both cache and network failed — return a minimal fallback
        // This only triggers for navigations (HTML requests)
        if (event.request.destination === "document") {
          return new Response(
            "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>" +
            "<title>Offline</title><style>" +
            "body{background:#080f1f;color:#e8edf5;font-family:sans-serif;" +
            "display:flex;flex-direction:column;align-items:center;" +
            "justify-content:center;min-height:100vh;text-align:center;gap:1rem}" +
            "h1{color:#38bdf8}p{color:#a8b8d0;max-width:40ch}" +
            "</style></head><body>" +
            "<h1>&#127758; You are offline</h1>" +
            "<p>Open <strong>index.html</strong> directly from the downloaded folder " +
            "to use this exhibition without an internet connection.</p>" +
            "</body></html>",
            {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" }
            }
          );
        }
        // For non-document requests (CSS, JS, images) return empty 204
        return new Response("", { status: 204 });
      });
    })
  );
});
