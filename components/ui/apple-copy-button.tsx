"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "cn";

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
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sizeClasses =
    size === "sm"
      ? (showText ? "h-7 w-20 px-2.5 text-[11px] shrink-0" : "h-7 w-7 p-0 text-[11px] shrink-0")
      : (showText ? "h-10 w-24 px-3.5 text-xs font-medium shrink-0" : "h-10 w-10 p-0 text-xs font-medium shrink-0");

  let variantClasses = "";
  if (variant === "primary") {
    variantClasses = copied
      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
      : "bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white shadow-xs";
  } else if (variant === "secondary") {
    variantClasses = copied
      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent shadow-sm"
      : "border border-border bg-secondary/60 text-foreground hover:bg-[#0066cc] hover:text-white hover:border-transparent";
  } else {
    variantClasses = copied
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : "text-muted-foreground hover:text-foreground hover:bg-secondary";
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedText : defaultText}
      className={cn(
        "apple-pill-btn relative overflow-hidden inline-flex items-center justify-center text-center select-none active:scale-95 transition-all duration-200 ease-out",
        sizeClasses,
        variantClasses,
        className
      )}
    >
      {/* Symmetrically Centered Content Grid */}
      <span className="inline-grid grid-cols-1 grid-rows-1 items-center justify-items-center leading-none">
        {/* Default State: Copy Icon + Default Text */}
        <span
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 text-center leading-none transition-opacity duration-200 ease-out",
            copied ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
          )}
        >
          <Copy className="w-3.5 h-3.5 shrink-0" />
          {showText && <span className="leading-none whitespace-nowrap">{defaultText}</span>}
        </span>

        {/* Copied State: Check Icon + Copied Text */}
        <span
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 text-center leading-none transition-opacity duration-200 ease-out",
            copied ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}
        >
          <Check className="w-3.5 h-3.5 shrink-0" />
          {showText && <span className="leading-none whitespace-nowrap">{copiedText}</span>}
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
