"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/hooks/use-copy";

export { useCopy };

export interface AppleCopyButtonProps {
  textToCopy: string;
  defaultText?: string;
  copiedText?: string;
  className?: string;
  /**
   * Mode of the copy button:
   * - "pill" (default): Apple liquid pill button with background, border, and specular sheen.
   * - "text": Pure text/icon button without background or border. Text and icon turn green when copied.
   */
  mode?: "pill" | "text";
  /**
   * Visual variant:
   * - "primary": Solid Apple blue / iOS 26 green gradient pill
   * - "secondary": Apple border/glass pill
   * - "text" / "ghost": Equivalent to mode="text"
   */
  variant?: "primary" | "secondary" | "text" | "ghost";
  size?: "sm" | "md";
  showText?: boolean;
  onCopied?: () => void;
}

export function AppleCopyButton({
  textToCopy,
  defaultText = "复制",
  copiedText = "已复制",
  className = "",
  mode,
  variant = "primary",
  size = "md",
  showText = true,
  onCopied,
}: AppleCopyButtonProps) {
  const { copied, copy } = useCopy({ onCopied });

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copy(textToCopy);
  };

  const isTextMode = mode === "text" || variant === "text" || variant === "ghost";

  // 1. TEXT MODE: No background, no border, text turns iOS 26 System Green, width strictly invariant
  if (isTextMode) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? copiedText : defaultText}
        className={cn(
          "relative inline-flex items-center justify-center text-center select-none cursor-pointer outline-none bg-transparent hover:bg-transparent border-0 shadow-none active:scale-95 transition-colors duration-200 ease-out",
          copied
            ? "text-[#34C759] dark:text-[#30D158] font-medium"
            : "text-muted-foreground hover:text-foreground font-medium",
          size === "sm" ? "text-xs min-w-0" : "text-sm min-w-0",
          className
        )}
      >
        {/* Dual-layer CSS Grid: Locks width to max(defaultText, copiedText) so width is 100% invariant */}
        <span className="inline-grid grid-cols-1 grid-rows-1 items-center justify-items-center leading-none">
          {/* Default state: Copy Icon + Default Text */}
          <span
            className={cn(
              "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 text-center leading-none whitespace-nowrap transition-opacity duration-200 ease-out",
              copied ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
            )}
          >
            <Copy className={cn("shrink-0 stroke-[2.2]", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
            {showText && defaultText && (
              <span className="leading-none whitespace-nowrap font-medium">{defaultText}</span>
            )}
          </span>

          {/* Copied state: Check Icon + Copied Text (iOS 26 System Green, no background, no border) */}
          <span
            className={cn(
              "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 text-center leading-none whitespace-nowrap transition-opacity duration-200 ease-out text-[#34C759] dark:text-[#30D158]",
              copied ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            )}
          >
            <Check className={cn("shrink-0 stroke-[2.2] text-[#34C759] dark:text-[#30D158]", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
            {showText && (
              <span className="leading-none whitespace-nowrap font-medium text-[#34C759] dark:text-[#30D158]">
                {copiedText}
              </span>
            )}
          </span>
        </span>
      </button>
    );
  }

  // 2. PILL MODE: Standard Apple pill button with background, border & iOS 26 System Green
  const pillSizeClasses =
    size === "sm"
      ? (showText ? "h-7 min-w-[84px] sm:min-w-[88px] px-3 sm:px-3.5 text-[11px] font-medium" : "h-7 w-7 p-0 text-[11px] font-medium shrink-0")
      : (showText ? "h-10 min-w-24 px-3.5 text-xs font-medium" : "h-10 w-10 p-0 text-xs font-medium shrink-0");

  // iOS 26 Apple Liquid Glass Green styling:
  // Radiant Apple System Green (#34C759 -> #30D158 -> #28CD41) with glass edge and luminescence
  const ios26GreenPill =
    "border border-white/25 dark:border-white/15 bg-gradient-to-r from-[#34C759] via-[#30D158] to-[#28CD41] !text-white shadow-[0_2px_10px_rgba(52,199,89,0.38)]";

  let pillVariantClasses = "";
  if (variant === "secondary") {
    pillVariantClasses = copied
      ? ios26GreenPill
      : "border border-border/80 bg-secondary/50 text-[#48484a] dark:text-[#d1d1d6] hover:text-foreground hover:bg-secondary";
  } else {
    pillVariantClasses = copied
      ? ios26GreenPill
      : "border border-transparent bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white shadow-xs";
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedText : defaultText}
      className={cn(
        "apple-pill-btn relative overflow-hidden inline-flex items-center justify-center text-center select-none active:scale-95 transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
        copied ? "!text-white" : "",
        pillSizeClasses,
        pillVariantClasses,
        className
      )}
    >
      {/* Symmetrically Centered Content Grid */}
      <span className="inline-grid grid-cols-1 grid-rows-1 items-center justify-items-center leading-none">
        {/* Default State: Copy Icon + Default Text */}
        <span
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 text-center leading-none whitespace-nowrap transition-opacity duration-200 ease-out",
            copied ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
          )}
        >
          <Copy className={cn("shrink-0 stroke-[2.2] opacity-75", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
          {showText && defaultText && (
            <span className="leading-none whitespace-nowrap font-medium">{defaultText}</span>
          )}
        </span>

        {/* Copied State: Check Icon + Copied Text */}
        <span
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 text-center leading-none whitespace-nowrap transition-opacity duration-200 ease-out !text-white",
            copied ? "opacity-100 visible !text-white" : "opacity-0 invisible pointer-events-none"
          )}
        >
          <Check className={cn("shrink-0 stroke-[2.2] !text-white", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
          {showText && (
            <span className="leading-none whitespace-nowrap !text-white font-medium">{copiedText}</span>
          )}
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
