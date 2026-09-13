"use client";

import * as React from "react";

export interface UseCopyOptions {
  /**
   * Duration in ms before the `copied` state reverts to `false`.
   * Defaults to 3000ms (3 seconds).
   */
  timeout?: number;
  /**
   * Optional callback triggered when copy succeeds.
   */
  onCopied?: () => void;
}

/**
 * Global unified clipboard copy hook for next-xboard.
 * - Manages async clipboard writing with fallback to execCommand.
 * - Handles unified countdown timer (default 3s).
 * - Refreshes countdown immediately on repeated clicks during copied state.
 * - Automatically cleans up timer on component unmount.
 */
export function useCopy({ timeout = 3000, onCopied }: UseCopyOptions = {}) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = React.useCallback(
    async (text: string) => {
      if (!text) return false;

      try {
        if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else if (typeof document !== "undefined") {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }

        // Reset timer if already running (e.g. repeated click in copied state)
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        setCopied(true);
        onCopied?.();

        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, timeout);

        return true;
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        return false;
      }
    },
    [timeout, onCopied]
  );

  return { copied, copy };
}
