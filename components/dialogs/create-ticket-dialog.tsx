"use client";

import * as React from "react";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { appleDialog } from "@/components/dialogs/apple-dialog";

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
      void appleDialog.alert({
        title: t("common.success"),
        message: t("tickets.submit_success"),
      });
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
      className="p-0 gap-0 overflow-hidden sm:max-w-[340px] rounded-[22px] border border-black/10 dark:border-white/12 shadow-2xl bg-card/95 backdrop-blur-2xl outline-none"
    >
      <form onSubmit={handleSubmit}>
        {/* Apple Centered Header */}
        <div className="pt-6 px-6 pb-3 flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-[14px] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center mb-2 select-none">
            <MessageSquarePlus className="w-5 h-5 stroke-[1.75]" />
          </div>
          <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-snug">
            {t("tickets.create_ticket")}
          </h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed font-normal">
            {t("tickets.prompt_message")}
          </p>
        </div>

        {/* iOS Inset Grouped Fields */}
        <div className="px-5 pb-5 space-y-2">
          <div className="rounded-[14px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/8 dark:border-white/10 divide-y divide-black/8 dark:divide-white/10 overflow-hidden">
            <div className="px-3.5 py-2.5">
              <input
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t("tickets.prompt_placeholder")}
                autoFocus
                className="w-full bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none select-text"
              />
            </div>
            <div className="px-3.5 py-2.5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="详细说明您遇到的问题（选填）..."
                rows={3}
                className="w-full bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none select-text leading-relaxed"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="px-1 text-xs text-destructive text-center font-medium leading-tight select-none">
              {errorMsg}
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
