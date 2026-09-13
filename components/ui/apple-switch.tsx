"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppleSwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  variant?: "green" | "blue";
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function AppleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  variant = "green",
  className,
  id,
  "aria-label": ariaLabel,
}: AppleSwitchProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onCheckedChange?.(!checked);
    }
  };

  const activeBg =
    variant === "blue"
      ? "bg-[#0071e3] dark:bg-[#0071e3]"
      : "bg-[#34c759] dark:bg-[#30d158]";

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative inline-flex items-center w-[54px] h-[24px] shrink-0 rounded-full p-[2px] transition-colors duration-250 ease-out cursor-pointer select-none",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0071e3]",
        checked
          ? activeBg
          : "bg-[#e9e9ea] dark:bg-[#39393d] border border-black/[0.04] dark:border-white/[0.06]",
        disabled && "opacity-50 cursor-not-allowed",
        "active:scale-[0.97] duration-150",
        className
      )}
    >
      {/* iOS Slider Thumb */}
      <span
        className={cn(
          "pointer-events-none block h-[20px] w-[20px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.18),0_1px_1px_rgba(0,0,0,0.12)] transition-all duration-250 ease-out",
          checked
            ? "translate-x-[30px]"
            : "translate-x-0"
        )}
      />
    </button>
  );
}
