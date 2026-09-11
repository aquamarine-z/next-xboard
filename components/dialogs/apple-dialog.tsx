"use client";

import * as React from "react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

export interface AppleDialogContentProps
  extends React.ComponentProps<typeof SurfaceDialogContent> {
  maxWidth?: string;
}

/**
 * Apple HIG Squircle Modal Card container wrapping Opalus SurfaceDialogContent.
 * Uses native Base UI + Opalus lifecycle, escape key listener, and exit animation detection.
 */
export function AppleDialogContent({
  children,
  className,
  maxWidth = "sm:max-w-[300px]",
  showCloseButton = false,
  ...props
}: AppleDialogContentProps) {
  return (
    <SurfaceDialogContent
      showCloseButton={showCloseButton}
      className={cn(
        "p-0 gap-0 overflow-hidden rounded-[22px] border border-black/10 dark:border-white/12 shadow-2xl bg-card/95 backdrop-blur-2xl outline-none select-auto",
        maxWidth,
        className
      )}
      {...props}
    >
      {children}
    </SurfaceDialogContent>
  );
}

/**
 * Backward compatibility alias for existing usages
 */
export const AppleDialogCard = AppleDialogContent;

export interface AppleAlertOptions {
  title?: React.ReactNode;
  message?: React.ReactNode;
  closeButtonContent?: React.ReactNode;
}

export interface AppleConfirmOptions {
  title?: React.ReactNode;
  message?: React.ReactNode;
  confirmButtonContent?: React.ReactNode;
  cancelButtonContent?: React.ReactNode;
  destructive?: boolean;
}

export interface ApplePromptOptions {
  title?: React.ReactNode;
  message?: React.ReactNode;
  defaultValue?: string;
  placeholder?: string;
  confirmButtonContent?: React.ReactNode;
  cancelButtonContent?: React.ReactNode;
}

/**
 * Apple HIG Dialog system directly powered by Opalus UI dialog.custom
 */
export const appleDialog = {
  /**
   * Directly exposes Opalus UI dialog.custom
   */
  custom: dialog.custom,

  /**
   * Apple HIG Alert dialog with bottom docked button
   */
  async alert(options: AppleAlertOptions = {}): Promise<void> {
    await dialog.custom<void>((close) => (
      <AppleDialogContent maxWidth="sm:max-w-[300px]">
        <div className="pt-5 px-5 pb-4 flex flex-col items-center text-center">
          <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-snug">
            {options.title ?? "提示"}
          </h3>
          {options.message && (
            <div className="mt-2 text-[13px] text-muted-foreground leading-relaxed font-normal">
              {options.message}
            </div>
          )}
        </div>
        <div className="border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            className="w-full h-11 flex items-center justify-center text-[16px] text-[#0071e3] dark:text-[#2997ff] font-semibold bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none"
            onClick={() => void close()}
          >
            {options.closeButtonContent ?? "好"}
          </button>
        </div>
      </AppleDialogContent>
    ));
  },

  /**
   * Apple HIG Confirm dialog with bottom docked split buttons
   */
  async confirm(options: AppleConfirmOptions = {}): Promise<boolean | null> {
    return dialog.custom<boolean>((close) => (
      <AppleDialogContent maxWidth="sm:max-w-[300px]">
        <div className="pt-5 px-5 pb-4 flex flex-col items-center text-center">
          <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-snug">
            {options.title ?? "确认"}
          </h3>
          {options.message && (
            <div className="mt-2 text-[13px] text-muted-foreground leading-relaxed font-normal">
              {options.message}
            </div>
          )}
        </div>
        <div className="border-t border-black/10 dark:border-white/10 grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 h-11 text-[16px]">
          <button
            type="button"
            className="w-full h-full flex items-center justify-center text-[16px] font-normal text-[#0071e3] dark:text-[#2997ff] bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none"
            onClick={() => void close(false)}
          >
            {options.cancelButtonContent ?? "取消"}
          </button>
          <button
            type="button"
            className={cn(
              "w-full h-full flex items-center justify-center text-[16px] font-semibold bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none",
              options.destructive
                ? "text-[#ff3b30] dark:text-[#ff453a] hover:text-[#e02b20]"
                : "text-[#0071e3] dark:text-[#2997ff]"
            )}
            onClick={() => void close(true)}
          >
            {options.confirmButtonContent ?? "确定"}
          </button>
        </div>
      </AppleDialogContent>
    ));
  },

  /**
   * Apple HIG Prompt dialog with inset text input and bottom docked split buttons
   */
  async prompt(options: ApplePromptOptions = {}): Promise<string | null> {
    return dialog.custom<string | null>((close) => (
      <AppleDialogContent maxWidth="sm:max-w-[300px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem(
              "apple-prompt-value"
            ) as HTMLInputElement;
            void close(input ? input.value : "");
          }}
        >
          <div className="pt-5 px-5 pb-2 flex flex-col items-center text-center">
            <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-snug">
              {options.title ?? "提示"}
            </h3>
            {options.message && (
              <div className="mt-2 text-[13px] text-muted-foreground leading-relaxed font-normal">
                {options.message}
              </div>
            )}
          </div>
          <div className="px-4 pb-4">
            <input
              name="apple-prompt-value"
              defaultValue={options.defaultValue}
              placeholder={options.placeholder}
              autoFocus
              className="w-full h-9 px-3 text-[14px] bg-black/[0.04] dark:bg-white/[0.08] border border-black/10 dark:border-white/10 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] text-foreground placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
          <div className="border-t border-black/10 dark:border-white/10 grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 h-11 text-[16px]">
            <button
              type="button"
              className="w-full h-full flex items-center justify-center text-[16px] text-[#0071e3] dark:text-[#2997ff] font-normal bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none"
              onClick={() => void close(null)}
            >
              {options.cancelButtonContent ?? "取消"}
            </button>
            <button
              type="submit"
              className="w-full h-full flex items-center justify-center text-[16px] text-[#0071e3] dark:text-[#2997ff] font-semibold bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none"
            >
              {options.confirmButtonContent ?? "确定"}
            </button>
          </div>
        </form>
      </AppleDialogContent>
    ));
  },
};
