"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { Search, Radio, QrCode, Globe } from "lucide-react";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
import { openNodeConnectDialog } from "@/components/dialogs";

export default function NodesPage() {
  const { t } = useTranslation();
  const { servers, fetchDashboardData } = useUserStore();
  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("all");

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Extract unique protocol types dynamically from real servers
  const availableTypes = React.useMemo(() => {
    const set = new Set<string>();
    servers.forEach((s) => {
      if (s.type) set.add(s.type.toUpperCase());
    });
    return ["all", ...Array.from(set)];
  }, [servers]);

  const filteredServers = servers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase());
    if (selectedType === "all") return matchesSearch;
    return matchesSearch && s.type.toUpperCase() === selectedType;
  });

  const showQrDialog = (server: any) => {
    openNodeConnectDialog(server, t);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold apple-headline tracking-tight text-foreground">
          {t("nodes.title")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {t("nodes.subtitle")}
        </p>
      </div>

      {/* Controls: Search & Dynamic Protocol Filters */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("nodes.search_placeholder")}
              className="w-full h-11 pl-11 pr-4 rounded-full bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0066cc] dark:focus:border-[#2997ff] transition-colors"
            />
          </div>

          <div className="text-xs text-muted-foreground font-mono select-none">
            {filteredServers.length} / {servers.length}
          </div>
        </div>

        {/* Dynamic Type Filter Chips */}
        {availableTypes.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 select-none">
            {availableTypes.map((type) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`apple-pill-btn shrink-0 whitespace-nowrap text-xs px-4 py-1.5 transition-all select-none ${
                    isSelected
                      ? "bg-[#0066cc] text-white"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {type === "all" ? t("nodes.all_types") : type}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Nodes Grid (Real data only) */}
      {filteredServers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server) => (
            <div
              key={server.id}
              className="apple-utility-card flex flex-col justify-between space-y-4 hover:border-[#0066cc]/40 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <h3 className="text-base font-semibold apple-headline text-foreground leading-tight truncate">
                      {server.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 select-none">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border select-none">
                        {server.type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border select-none">
                        {t("nodes.rate", { rate: server.rate || "1.0" })}
                      </span>
                    </div>
                  </div>

                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1 select-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => showQrDialog(server)}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors select-none"
                >
                  <QrCode className="w-3.5 h-3.5 select-none" />
                  <span className="select-none">{t("nodes.qr_code")}</span>
                </button>

                <AppleCopyButton
                  textToCopy={`${server.type.toLowerCase()}://${server.name}`}
                  defaultText={t("common.copy")}
                  copiedText={t("common.copied")}
                  size="sm"
                  variant="secondary"
                  className="w-20 h-7 shrink-0"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="apple-utility-card py-16 text-center space-y-3">
          <Globe className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
          <p className="text-sm text-muted-foreground">{t("nodes.empty")}</p>
        </div>
      )}
    </div>
  );
}