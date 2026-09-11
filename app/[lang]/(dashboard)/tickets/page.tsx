"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { formatDate } from "@/lib/format";
import { Plus, MessageSquare, Clock } from "lucide-react";
import { openCreateTicketDialog } from "@/components/dialogs";

export default function TicketsPage() {
  const { t } = useTranslation();
  const { tickets, fetchDashboardData } = useUserStore();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateTicket = () => {
    openCreateTicketDialog(t, fetchDashboardData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-semibold apple-headline tracking-tight text-foreground">
            {t("tickets.title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("tickets.subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateTicket}
          className="apple-pill-btn bg-[#0066cc] hover:bg-[#0071e3] text-white flex items-center gap-2 shadow-sm font-medium self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("tickets.create_ticket")}</span>
        </button>
      </div>

      {/* Real Tickets List */}
      {tickets && tickets.length > 0 ? (
        <div className="space-y-3.5">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="apple-utility-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground select-none">
                      <span className="select-none">#</span>{ticket.id}
                    </span>
                    <h3 className="text-base font-semibold apple-headline text-foreground">
                      {ticket.subject}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                    <span className="flex items-center gap-1 select-none">
                      <Clock className="w-3.5 h-3.5 select-none" />
                      <span className="select-none">{formatDate(ticket.created_at)}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center select-none">
                <span
                  className={`apple-pill-btn py-1 px-3 text-[11px] font-medium select-none ${
                    ticket.status === 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {ticket.status === 0
                    ? t("tickets.status_open")
                    : t("tickets.status_closed")}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="apple-utility-card py-16 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
          <p className="text-sm text-muted-foreground">{t("tickets.empty")}</p>
        </div>
      )}
    </div>
  );
}