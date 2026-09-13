"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppleCopyButtonProps {
  textToCopy: string;
  defaultText?: string;
  copiedText?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  showText?: boolean;
  onCopied?: () => void;
}

export function AppleCopyButton({
  textToCopy,
  defaultText = "复制",
  copiedText = "已复制",
  className = "",
  variant = "primary",
  size = "md",
  showText = true,
  onCopied,
}: AppleCopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      // If already copied or previous timer running, clear it and restart countdown
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setCopied(true);
      onCopied?.();

      // Extended timeout from 2000ms to 3000ms (+1s), and refresh timer on re-click
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sizeClasses =
    size === "sm"
      ? (showText ? "h-7 min-w-[84px] sm:min-w-[88px] px-3 sm:px-3.5 text-[11px] font-medium" : "h-7 w-7 p-0 text-[11px] font-medium shrink-0")
      : (showText ? "h-10 min-w-24 px-3.5 text-xs font-medium" : "h-10 w-10 p-0 text-xs font-medium shrink-0");

  let variantClasses = "";
  if (variant === "primary") {
    variantClasses = copied
      ? "border border-transparent bg-gradient-to-r from-emerald-500 to-teal-600 !text-white shadow-sm"
      : "border border-transparent bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white shadow-xs";
  } else if (variant === "secondary") {
    variantClasses = copied
      ? "border border-transparent bg-gradient-to-r from-emerald-500 to-teal-600 !text-white shadow-sm"
      : "border border-border/80 bg-secondary/50 text-[#48484a] dark:text-[#d1d1d6] hover:text-foreground hover:bg-secondary";
  } else {
    variantClasses = copied
      ? "border border-transparent bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400"
      : "border border-transparent text-[#636366] dark:text-[#a1a1a6] hover:text-foreground hover:bg-secondary";
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedText : defaultText}
      className={cn(
        "apple-pill-btn relative overflow-hidden inline-flex items-center justify-center text-center select-none active:scale-95 transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
        copied ? "!text-white" : "",
        sizeClasses,
        variantClasses,
        className
      )}
    >
      {/* Symmetrically Centered Content Grid */}
      <span className="inline-grid grid-cols-1 grid-rows-1 items-center justify-items-center leading-none">
        {/* Default State: Copy Icon + Default Text (Soft Graphite) */}
        <span
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 text-center leading-none transition-opacity duration-200 ease-out",
            copied ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
          )}
        >
          <Copy className="w-3.5 h-3.5 shrink-0 opacity-75 stroke-[2.2]" />
          {showText && <span className="leading-none whitespace-nowrap font-medium">{defaultText}</span>}
        </span>

        {/* Copied State: Check Icon + Copied Text (Pure White) */}
        <span
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 text-center leading-none transition-opacity duration-200 ease-out !text-white",
            copied ? "opacity-100 visible !text-white" : "opacity-0 invisible pointer-events-none"
          )}
        >
          <Check className="w-3.5 h-3.5 shrink-0 !text-white stroke-[2.2]" />
          {showText && <span className="leading-none whitespace-nowrap !text-white font-medium">{copiedText}</span>}
        </span>
      </span>

      {/* Subtle Apple Sheen Flash Overlay */}
      <span
        className={cn(
          "absolute inset-0 bg-white/20 pointer-events-none transition-opacity duration-200 ease-out",
          copied ? "opacity-100" : "opacity-0"
        )}
      />
    </button>
  );
}
