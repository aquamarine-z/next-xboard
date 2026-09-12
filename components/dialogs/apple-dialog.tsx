"use client";

import * as React from "react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import { AlertCircle, HelpCircle } from "lucide-react";

export interface AppleDialogContentProps
  extends React.ComponentProps<typeof SurfaceDialogContent> {
  maxWidth?: string;
}

/**
 * Apple HIG Squircle Modal Card container wrapping Opalus SurfaceDialogContent.
 * Upgraded to iOS 26 Liquid Spatial Glass with specular rim lighting and continuous squircle curvature.
 */
export function AppleDialogContent({
  children,
  className,
  maxWidth = "sm:max-w-[360px]",
  showCloseButton = false,
  ...props
}: AppleDialogContentProps) {
  return (
    <SurfaceDialogContent
      showCloseButton={showCloseButton}
      className={cn(
        "p-0 gap-0 overflow-hidden rounded-[28px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none select-auto transition-all",
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
  icon?: React.ReactNode;
}

export interface AppleConfirmOptions {
  title?: React.ReactNode;
  message?: React.ReactNode;
  confirmButtonContent?: React.ReactNode;
  cancelButtonContent?: React.ReactNode;
  destructive?: boolean;
  icon?: React.ReactNode;
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
 * Transformed to iOS 26 Floating Action Pill architecture
 */
export const appleDialog = {
  /**
   * Directly exposes Opalus UI dialog.custom
   */
  custom: dialog.custom,

  /**
   * Apple HIG Alert dialog with modern iOS 26 floating action pill
   */
  async alert(options: AppleAlertOptions = {}): Promise<void> {
    await dialog.custom<void>((close) => (
      <AppleDialogContent maxWidth="sm:max-w-[360px]">
        <div className="pt-6 px-6 pb-4 flex flex-col items-center text-center">
          {options.icon ? (
            <div className="mb-3">{options.icon}</div>
          ) : (
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-b from-[#0071e3]/15 to-[#0071e3]/5 dark:from-[#2997ff]/20 dark:to-[#2997ff]/10 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 flex items-center justify-center mb-3 shadow-xs select-none">
              <AlertCircle className="w-6 h-6 stroke-[1.8]" />
            </div>
          )}
          <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.015em] leading-snug">
            {options.title ?? "提示"}
          </h3>
          {options.message && (
            <div className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed font-normal px-2">
              {options.message}
            </div>
          )}
        </div>
        <div className="p-4 pt-1">
          <button
            type="button"
            className="w-full h-11 flex items-center justify-center text-[15px] font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] rounded-full shadow-[0_4px_14px_rgba(0,113,227,0.3)] dark:shadow-[0_4px_18px_rgba(41,151,255,0.25)] transition-all ios26-press select-none cursor-pointer outline-none"
            onClick={() => void close()}
          >
            {options.closeButtonContent ?? "好"}
          </button>
        </div>
      </AppleDialogContent>
    ));
  },

  /**
   * Apple HIG Confirm dialog with modern iOS 26 floating action pills
   */
  async confirm(options: AppleConfirmOptions = {}): Promise<boolean | null> {
    return dialog.custom<boolean>((close) => (
      <AppleDialogContent maxWidth="sm:max-w-[360px]">
        <div className="pt-6 px-6 pb-4 flex flex-col items-center text-center">
          {options.icon ? (
            <div className="mb-3">{options.icon}</div>
          ) : options.destructive ? (
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-b from-destructive/15 to-destructive/5 text-destructive border border-destructive/20 flex items-center justify-center mb-3 shadow-xs select-none">
              <AlertCircle className="w-6 h-6 stroke-[1.8]" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-b from-[#0071e3]/15 to-[#0071e3]/5 dark:from-[#2997ff]/20 dark:to-[#2997ff]/10 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 flex items-center justify-center mb-3 shadow-xs select-none">
              <HelpCircle className="w-6 h-6 stroke-[1.8]" />
            </div>
          )}
          <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.015em] leading-snug">
            {options.title ?? "确认"}
          </h3>
          {options.message && (
            <div className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed font-normal px-2">
              {options.message}
            </div>
          )}
        </div>
        <div className="p-4 pt-1 flex items-center gap-2.5">
          <button
            type="button"
            className="flex-1 h-11 flex items-center justify-center text-[15px] font-medium text-foreground/90 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.1] dark:active:bg-white/[0.15] border border-black/5 dark:border-white/10 rounded-full transition-all ios26-press select-none cursor-pointer outline-none"
            onClick={() => void close(false)}
          >
            {options.cancelButtonContent ?? "取消"}
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 h-11 flex items-center justify-center text-[15px] font-semibold text-white rounded-full transition-all ios26-press select-none cursor-pointer outline-none",
              options.destructive
                ? "bg-[#ff3b30] hover:bg-[#ff453a] active:bg-[#e02b20] shadow-[0_4px_14px_rgba(255,59,48,0.35)]"
                : "bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] shadow-[0_4px_14px_rgba(0,113,227,0.3)] dark:shadow-[0_4px_18px_rgba(41,151,255,0.25)]"
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
   * Apple HIG Prompt dialog with inset text input and modern iOS 26 floating action pills
   */
  async prompt(options: ApplePromptOptions = {}): Promise<string | null> {
    return dialog.custom<string | null>((close) => (
      <AppleDialogContent maxWidth="sm:max-w-[360px]">
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
          <div className="pt-6 px-6 pb-2 flex flex-col items-center text-center">
            <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.015em] leading-snug">
              {options.title ?? "提示"}
            </h3>
            {options.message && (
              <div className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed font-normal px-2">
                {options.message}
              </div>
            )}
          </div>
          <div className="px-5 py-3">
            <input
              name="apple-prompt-value"
              defaultValue={options.defaultValue}
              placeholder={options.placeholder}
              autoFocus
              className="w-full h-11 px-4 text-[14px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/8 dark:border-white/10 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/35 dark:focus:ring-[#2997ff]/45 text-foreground placeholder:text-muted-foreground/50 transition-all select-text"
            />
          </div>
          <div className="p-4 pt-1 flex items-center gap-2.5">
            <button
              type="button"
              className="flex-1 h-11 flex items-center justify-center text-[15px] font-medium text-foreground/90 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.1] dark:active:bg-white/[0.15] border border-black/5 dark:border-white/10 rounded-full transition-all ios26-press select-none cursor-pointer outline-none"
              onClick={() => void close(null)}
            >
              {options.cancelButtonContent ?? "取消"}
            </button>
            <button
              type="submit"
              className="flex-1 h-11 flex items-center justify-center text-[15px] font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] shadow-[0_4px_14px_rgba(0,113,227,0.3)] dark:shadow-[0_4px_18px_rgba(41,151,255,0.25)] rounded-full transition-all ios26-press select-none cursor-pointer outline-none"
            >
              {options.confirmButtonContent ?? "确定"}
            </button>
          </div>
        </form>
      </AppleDialogContent>
    ));
  },
};

