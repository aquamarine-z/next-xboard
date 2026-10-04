"use client";

/**
 * Universal modal lock manager for iOS WebKit & all modern browsers.
 * Directly toggles `data-modal-open="true"` on `<html>` root (`document.documentElement`),
 * bypassing WebKit's broken `:has()` selector invalidation bug when React Portals are appended to `<body>`.
 */

export function incrementModalCount() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const count = parseInt(root.getAttribute("data-modal-count") || "0", 10);
  root.setAttribute("data-modal-count", String(count + 1));
  root.setAttribute("data-modal-open", "true");
}

export function decrementModalCount() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const currentCount = parseInt(root.getAttribute("data-modal-count") || "1", 10);
  const nextCount = Math.max(0, currentCount - 1);
  if (nextCount === 0) {
    root.removeAttribute("data-modal-count");
    root.removeAttribute("data-modal-open");
  } else {
    root.setAttribute("data-modal-count", String(nextCount));
  }
}
