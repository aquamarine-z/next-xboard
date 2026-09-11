"use client";

import * as React from "react";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { appleDialog } from "@/components/dialogs/apple-dialog";

export interface ChangePasswordModalProps {
  t: (key: string, params?: Record<string, any>) => string;
  close: (result?: boolean) => void | Promise<void>;
}

export function ChangePasswordModal({ t, close }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const isValidLength = newPassword.length >= 8;
  const isMatch = newPassword === confirmPassword;
  const canSubmit = isValidLength && isMatch && !loading;

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
          current_password: "",
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        void close(true);
        void appleDialog.alert({
          title: t("common.success"),
          message: t("profile.password_success"),
        });
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
      className="p-0 gap-0 overflow-hidden sm:max-w-[340px] rounded-[22px] border border-black/10 dark:border-white/12 shadow-2xl bg-card/95 backdrop-blur-2xl outline-none"
    >
      <form onSubmit={handleSubmit}>
        {/* Apple Centered Header */}
        <div className="pt-6 px-6 pb-3 flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-[14px] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center mb-2 select-none">
            <KeyRound className="w-5 h-5 stroke-[2]" />
          </div>
          <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-snug">
            {t("profile.password_prompt_title")}
          </h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed font-normal">
            {t("profile.password_prompt_message")}
          </p>
        </div>

        {/* iOS Inset Grouped Fields */}
        <div className="px-5 pb-5 space-y-2">
          <div className="rounded-[14px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/8 dark:border-white/10 divide-y divide-black/8 dark:divide-white/10 overflow-hidden">
            {/* New Password */}
            <div className="relative flex items-center px-3.5 h-11">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t("profile.new_password")}
                autoFocus
                className="w-full bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none pr-8 select-text"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-muted-foreground/60 hover:text-foreground transition-colors select-none cursor-pointer"
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
            <div className="relative flex items-center px-3.5 h-11">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t("profile.confirm_new_password")}
                className="w-full bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none pr-8 select-text"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 p-1 text-muted-foreground/60 hover:text-foreground transition-colors select-none cursor-pointer"
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

        {/* Docked Hairline Button Bar */}
        <div className="border-t border-black/10 dark:border-white/10 grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 h-11 text-[16px]">
          <button
            type="button"
            disabled={loading}
            onClick={() => void close(false)}
            className="w-full h-full flex items-center justify-center text-[16px] font-normal text-[#0071e3] dark:text-[#2997ff] bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-full flex items-center justify-center text-[16px] font-semibold text-[#0071e3] dark:text-[#2997ff] disabled:opacity-40 disabled:pointer-events-none bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none gap-2"
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
