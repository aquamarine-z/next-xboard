"use client";

import * as React from "react";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { toast } from "@/components/ui/sonner";

export interface ChangePasswordModalProps {
  t: (key: string, params?: Record<string, any>) => string;
  close: (result?: boolean) => void | Promise<void>;
}

export function ChangePasswordModal({ t, close }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const hasCurrent = currentPassword.trim().length > 0;
  const isValidLength = newPassword.length >= 8;
  const isMatch = newPassword === confirmPassword;
  const canSubmit = hasCurrent && isValidLength && isMatch && !loading;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/xboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          current_password: currentPassword,
          old_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        void close(true);
        toast.success(t("profile.password_success"));
      } else {
        const data = await res.json();
        setErrorMsg(data.error || t("common.failed"));
      }
    } catch (err: any) {
      setErrorMsg(err.message || t("common.network_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[380px] rounded-[28px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none"
    >
      <form onSubmit={handleSubmit}>
        {/* Apple Centered Header */}
        <div className="pt-7 px-6 pb-3 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-b from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3 shadow-xs select-none">
            <KeyRound className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.015em] leading-snug">
            {t("profile.password_prompt_title")}
          </h3>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed font-normal px-2">
            {t("profile.password_prompt_message")}
          </p>
        </div>

        {/* iOS Inset Grouped Fields: Current Password, New Password, Confirm Password */}
        <div className="px-6 pb-4 space-y-2.5">
          <div className="rounded-[18px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/6 dark:border-white/8 divide-y divide-black/6 dark:divide-white/8 overflow-hidden">
            {/* Current / Old Password */}
            <div className="relative flex items-center px-4 h-12">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t("profile.current_password")}
                autoFocus
                className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none pr-8 select-text"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 p-1 text-muted-foreground/60 hover:text-foreground transition-colors select-none cursor-pointer"
                tabIndex={-1}
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* New Password */}
            <div className="relative flex items-center px-4 h-12">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t("profile.new_password")}
                className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none pr-8 select-text"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 text-muted-foreground/60 hover:text-foreground transition-colors select-none cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative flex items-center px-4 h-12">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t("profile.confirm_new_password")}
                className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none pr-8 select-text"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 p-1 text-muted-foreground/60 hover:text-foreground transition-colors select-none cursor-pointer"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Validation Feedback */}
          {errorMsg && (
            <p className="px-1 text-xs text-destructive text-center font-medium leading-tight select-none">
              {errorMsg}
            </p>
          )}
          {!errorMsg && newPassword && !isValidLength && (
            <p className="px-1 text-xs text-amber-600 dark:text-amber-400 text-center font-normal leading-tight select-none">
              {t("profile.password_too_short")}
            </p>
          )}
          {!errorMsg && isValidLength && confirmPassword && !isMatch && (
            <p className="px-1 text-xs text-destructive text-center font-normal leading-tight select-none">
              {t("profile.password_mismatch")}
            </p>
          )}
        </div>

        {/* Floating Action Pill Bar */}
        <div className="p-4 pt-1 flex items-center gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => void close(false)}
            className="flex-1 h-11 flex items-center justify-center text-[15px] font-medium text-foreground/90 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.1] dark:active:bg-white/[0.15] border border-black/5 dark:border-white/10 rounded-full transition-all ios26-press select-none cursor-pointer outline-none"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 h-11 flex items-center justify-center text-[15px] font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] shadow-[0_4px_14px_rgba(0,113,227,0.3)] dark:shadow-[0_4px_18px_rgba(41,151,255,0.25)] disabled:opacity-40 disabled:pointer-events-none rounded-full transition-all ios26-press select-none cursor-pointer outline-none gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{t("common.save")}</span>
          </button>
        </div>
      </form>
    </SurfaceDialogContent>
  );
}

export function openChangePasswordDialog(
  t: (key: string, params?: Record<string, any>) => string
): Promise<boolean | null> {
  return dialog.custom<boolean>((close) => (
    <ChangePasswordModal t={t} close={close} />
  ));
}
