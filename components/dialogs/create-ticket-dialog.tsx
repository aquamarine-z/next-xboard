"use client";

import * as React from "react";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { toast } from "@/components/ui/sonner";

export interface CreateTicketModalProps {
  t: (key: string, params?: Record<string, any>) => string;
  close: (result?: boolean) => void | Promise<void>;
  onCreated: () => void;
}

export function CreateTicketModal({
  t,
  close,
  onCreated,
}: CreateTicketModalProps) {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const canSubmit = subject.trim().length > 0 && !loading;

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
          action: "create_ticket",
          subject: subject.trim(),
          level: 1,
          message: message.trim() || subject.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("common.failed"));

      void close(true);
      toast.success(t("tickets.submit_success"));
      onCreated();
    } catch (err: any) {
      setErrorMsg(err.message || t("common.network_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[400px] rounded-[28px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none"
    >
      <form onSubmit={handleSubmit}>
        {/* Apple Centered Header */}
        <div className="pt-7 px-6 pb-3 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-b from-[#0071e3]/15 to-[#0071e3]/5 dark:from-[#2997ff]/20 dark:to-[#2997ff]/10 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 flex items-center justify-center mb-3 shadow-xs select-none">
            <MessageSquarePlus className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.015em] leading-snug">
            {t("tickets.create_ticket")}
          </h3>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed font-normal px-2">
            {t("tickets.prompt_message")}
          </p>
        </div>

        {/* iOS Inset Grouped Fields */}
        <div className="px-6 pb-4 space-y-2.5">
          <div className="rounded-[18px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/6 dark:border-white/8 divide-y divide-black/6 dark:divide-white/8 overflow-hidden">
            <div className="px-4 py-3">
              <input
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t("tickets.prompt_placeholder")}
                autoFocus
                className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none select-text"
              />
            </div>
            <div className="px-4 py-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="详细说明您遇到的问题（选填）..."
                rows={3}
                className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none select-text leading-relaxed"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="px-1 text-xs text-destructive text-center font-medium leading-tight select-none">
              {errorMsg}
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
            <span>{t("common.confirm")}</span>
          </button>
        </div>
      </form>
    </SurfaceDialogContent>
  );
}

export function openCreateTicketDialog(
  t: (key: string, params?: Record<string, any>) => string,
  onCreated: () => void
): Promise<boolean | null> {
  return dialog.custom<boolean>((close) => (
    <CreateTicketModal t={t} close={close} onCreated={onCreated} />
  ));
}
