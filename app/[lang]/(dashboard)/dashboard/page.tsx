"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { formatBytes, formatDate } from "@/lib/format";
import {
  Zap,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  Bell,
  Sparkles,
  Signal,
  LogIn,
  ShoppingBag,
  Copy,
  Check,
  Radio,
  ArrowUp,
  ArrowDown,
  Wallet,
  Search,
  QrCode,
  Globe,
  X,
  Info,
  Activity,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { openQuickImportDialog, openNodeConnectDialog, openNoticeDialog } from "@/components/dialogs";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
import { AppleCloudIcon, AppleAppBadge } from "@/components/ui/apple-icons";
import { cn } from "@/lib/utils";
import type { XboardTrafficLog } from "@/types/xboard";

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const {
    authenticated,
    user,
    subscribe,
    servers,
    notices,
    plans,
    config,
    fetchDashboardData,
  } = useUserStore();

  const [dashboardTab, setDashboardTab] = React.useState<"nodes" | "traffic">("nodes");
  const [trafficLogs, setTrafficLogs] = React.useState<XboardTrafficLog[]>([]);
  const [trafficLoading, setTrafficLoading] = React.useState(false);

  const fetchTrafficLogs = React.useCallback(async () => {
    setTrafficLoading(true);
    try {
      const res = await fetch("/api/xboard?type=traffic_log");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTrafficLogs(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch traffic logs:", err);
    } finally {
      setTrafficLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  React.useEffect(() => {
    if (dashboardTab === "traffic" && trafficLogs.length === 0) {
      fetchTrafficLogs();
    }
  }, [dashboardTab, trafficLogs.length, fetchTrafficLogs]);

  // Notice Modal & LocalStorage unread tracking
  const [readNoticeIds, setReadNoticeIds] = React.useState<number[]>([]);
  const hasAutoCheckedNotices = React.useRef(false);

  // 1. Load read notice IDs from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("xboard_read_notice_ids");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReadNoticeIds(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load read notice IDs from localStorage:", e);
    }
  }, []);

  // Mark single notice as read
  const handleMarkNoticeRead = React.useCallback((id: number) => {
    setReadNoticeIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem("xboard_read_notice_ids", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save read notice IDs:", e);
      }
      return next;
    });
  }, []);

  // Mark all notices as read when acknowledging
  const handleAcknowledgeAllNotices = React.useCallback(() => {
    if (!notices || notices.length === 0) return;
    setReadNoticeIds((prev) => {
      const allIds = Array.from(new Set([...prev, ...notices.map((n) => n.id)]));
      try {
        localStorage.setItem("xboard_read_notice_ids", JSON.stringify(allIds));
      } catch (e) {
        console.error("Failed to save read notice IDs:", e);
      }
      return allIds;
    });
  }, [notices]);

  // Open Opalus UI notice modal
  const handleOpenNoticeModal = React.useCallback(() => {
    if (!notices || notices.length === 0) return;
    openNoticeDialog({
      notices,
      readNoticeIds,
      onMarkRead: handleMarkNoticeRead,
      onAcknowledgeAll: handleAcknowledgeAllNotices,
      t,
      formatDate,
    });
  }, [notices, readNoticeIds, handleMarkNoticeRead, handleAcknowledgeAllNotices, t]);

  // 2. If notices exist and has unread, auto popup on enter once using Opalus UI
  React.useEffect(() => {
    if (notices && notices.length > 0 && !hasAutoCheckedNotices.current) {
      try {
        const stored = localStorage.getItem("xboard_read_notice_ids");
        const parsed: number[] = stored ? JSON.parse(stored) : [];
        const hasUnread = notices.some((n) => !parsed.includes(n.id));
        if (hasUnread) {
          openNoticeDialog({
            notices,
            readNoticeIds: parsed,
            onMarkRead: handleMarkNoticeRead,
            onAcknowledgeAll: handleAcknowledgeAllNotices,
            t,
            formatDate,
          });
        }
        hasAutoCheckedNotices.current = true;
      } catch (e) {
        console.error("Auto notice popup check error:", e);
      }
    }
  }, [notices, handleMarkNoticeRead, handleAcknowledgeAllNotices, t]);

  const unreadNoticesCount = React.useMemo(() => {
    if (!notices) return 0;
    return notices.filter((n) => !readNoticeIds.includes(n.id)).length;
  }, [notices, readNoticeIds]);

  const u = (user?.u ?? subscribe?.u) || 0;
  const d = (user?.d ?? subscribe?.d) || 0;
  const usedTraffic = u + d;
  const totalTraffic = (user?.transfer_enable ?? subscribe?.transfer_enable) || 1;
  const remainingTraffic = Math.max(0, totalTraffic - usedTraffic);
  const trafficPercent = Math.min(100, Math.round((usedTraffic / totalTraffic) * 100));

  // Find real active plan name from backend plans if matching
  const currentPlan = (subscribe as any)?.plan || (user as any)?.plan || plans.find(
    (p) => Number(p.id) === Number(user?.plan_id || subscribe?.plan_id)
  );
  const planDisplayName = currentPlan?.name || (user?.plan_id || subscribe?.plan_id ? `VIP ${user?.plan_id || subscribe?.plan_id}` : (authenticated ? t("dashboard.plan_title") : t("dashboard.no_active_plan")));

  // Check real status
  const isExpired = Boolean(
    user?.expired_at && user.expired_at > 0 && user.expired_at * 1000 < Date.now()
  );
  const isExhausted = Boolean(
    user?.transfer_enable && user.transfer_enable > 0 && usedTraffic >= user.transfer_enable
  );

  // Integrated Node List State
  const [nodeSearch, setNodeSearch] = React.useState("");
  const [selectedNodeType, setSelectedNodeType] = React.useState("all");

  // Extract unique protocol types dynamically from real servers
  const availableNodeTypes = React.useMemo(() => {
    const set = new Set<string>();
    servers.forEach((s) => {
      if (s.type) set.add(s.type.toUpperCase());
    });
    return ["all", ...Array.from(set)];
  }, [servers]);

  const filteredServers = React.useMemo(() => {
    return servers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(nodeSearch.toLowerCase()) ||
        s.type.toLowerCase().includes(nodeSearch.toLowerCase());
      if (selectedNodeType === "all") return matchesSearch;
      return matchesSearch && s.type.toUpperCase() === selectedNodeType;
    });
  }, [servers, nodeSearch, selectedNodeType]);

  const showQrDialog = (server: any) => {
    openNodeConnectDialog(server, t);
  };

  return (
    <div className="space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      {/* 1. iOS Large Title / User Greeting */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold apple-headline tracking-tight text-foreground">
          {authenticated && user
            ? t("dashboard.greeting", { name: user.email.split("@")[0] })
            : config?.app_description || t("common.app_name")}
        </h1>
        {authenticated && user && (
          <p className="text-sm text-muted-foreground font-normal">
            {user.email}
          </p>
        )}
      </div>

      {/* 2. System Notice Capsule Bar (iOS 26 Liquid Capsule Banner) */}
      {notices && notices.length > 0 && (
        <section className="space-y-2">
          <div
            onClick={handleOpenNoticeModal}
            className="p-3.5 sm:p-4 rounded-[20px] border border-border/80 bg-card hover:border-[#0066cc]/40 dark:hover:border-[#2997ff]/40 flex items-center justify-between gap-3.5 transition-all shadow-2xs cursor-pointer select-none group ios-touch-feedback"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 text-[#0066cc] dark:text-[#2997ff] border border-[#0071e3]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
                <span className="text-xs font-semibold text-foreground shrink-0">
                  {t("notices.latest")}:
                </span>
                <span className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
                  {notices[0]?.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {unreadNoticesCount > 0 && (
                <span className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>{unreadNoticesCount} {t("notices.unread")}</span>
                </span>
              )}
              <span className="text-xs font-medium text-[#0066cc] dark:text-[#2997ff] flex items-center gap-0.5 group-hover:underline">
                <span>{t("notices.view_all")}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 3. Subscription Pass Card (iOS 26 Liquid Spatial Card) */}
      <section className="rounded-[24px] sm:rounded-[28px] border border-border/80 bg-card p-5 sm:p-7 space-y-6 shadow-xs relative overflow-hidden">
        {/* Card Header: Plan Name & Real Status */}
        <div className="flex items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            <AppleAppBadge size="md">
              <AppleCloudIcon className="w-5 h-5 text-[#86868b] dark:text-[#a1a1a6]" />
            </AppleAppBadge>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold apple-headline tracking-tight text-foreground truncate">
                {planDisplayName}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {config?.app_description || "Aqua VPS"}
              </p>
            </div>
          </div>

          {authenticated ? (
            <div className="shrink-0 select-none">
              {isExpired ? (
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive select-none" />
                  <span>{t("common.status.expired")}</span>
                </span>
              ) : isExhausted ? (
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 select-none" />
                  <span>{t("common.status.exhausted")}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse select-none" />
                  <span>{t("common.status.active")}</span>
                </span>
              )}
            </div>
          ) : (
            <Link href={`/${locale}/login`} className="shrink-0">
              <button
                type="button"
                className="apple-pill-btn bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs flex items-center gap-1.5 py-1 px-3.5 select-none h-8"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("auth.login_button")}</span>
              </button>
            </Link>
          )}
        </div>

        {/* Quota Numbers & Fluid Progress Bar */}
        <div className="space-y-3.5">
          <div className="flex items-end justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase select-none block">
                {t("dashboard.traffic_used")}
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-semibold apple-hero tracking-tight text-foreground font-mono">
                  {authenticated && user ? formatBytes(usedTraffic) : "0 B"}
                </span>
                <span className="text-sm sm:text-base text-muted-foreground font-normal font-mono">
                  <span className="select-none">/ </span>
                  {authenticated && user ? formatBytes(totalTraffic) : "0 B"}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0 select-none">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-[#0066cc]/10 text-[#0066cc] dark:bg-[#2997ff]/15 dark:text-[#2997ff] border border-[#0066cc]/20">
                {authenticated && user ? `${trafficPercent}%` : "0%"}
              </span>
            </div>
          </div>

          {/* Segmented Liquid Progress Capsule */}
          <div className="w-full h-3 bg-secondary/80 dark:bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-border/70 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,113,227,0.35)]"
              style={{
                width: `${authenticated && user ? Math.max(3, trafficPercent) : 0}%`,
              }}
            />
          </div>

          {/* Clean Metric Sub-bar: Remaining & Expiration/Reset */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5 select-none">
            <div className="flex items-center gap-1.5">
              <span>{t("dashboard.traffic_remaining")}:</span>
              <span className="font-semibold text-foreground font-mono select-text">
                {authenticated && user ? formatBytes(remainingTraffic) : "0 B"}
              </span>
            </div>

            {Boolean(subscribe?.reset_day && subscribe.reset_day > 0) ? (
              <span className="text-[11px] text-muted-foreground font-medium">
                {t("dashboard.traffic_reset", { days: subscribe?.reset_day || 0 })}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                {user?.expired_at ? `${t("dashboard.expire_time")}: ${formatDate(user.expired_at)}` : t("dashboard.never_expire")}
              </span>
            )}
          </div>
        </div>

        {/* Bento Metrics Matrix: 4 Non-redundant Distinct Details */}
        {authenticated && user && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
            {/* 1. 上行流量 (Upload) */}
            <div className="p-3 sm:p-3.5 rounded-[18px] bg-secondary/40 dark:bg-white/[0.03] border border-border/50 flex flex-col justify-between gap-2 transition-all hover:bg-secondary/60">
              <div className="flex items-center gap-2 select-none">
                <div className="w-6 h-6 rounded-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-muted-foreground text-[11px] font-medium truncate">
                  {t("dashboard.traffic_upload")}
                </span>
              </div>
              <span className="font-semibold text-foreground text-[14px] sm:text-[15px] font-mono block truncate">
                {formatBytes(u)}
              </span>
            </div>

            {/* 2. 下行流量 (Download) */}
            <div className="p-3 sm:p-3.5 rounded-[18px] bg-secondary/40 dark:bg-white/[0.03] border border-border/50 flex flex-col justify-between gap-2 transition-all hover:bg-secondary/60">
              <div className="flex items-center gap-2 select-none">
                <div className="w-6 h-6 rounded-[8px] bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center shrink-0">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
                <span className="text-muted-foreground text-[11px] font-medium truncate">
                  {t("dashboard.traffic_download")}
                </span>
              </div>
              <span className="font-semibold text-foreground text-[14px] sm:text-[15px] font-mono block truncate">
                {formatBytes(d)}
              </span>
            </div>

            {/* 3. 到期时间 (Expires) */}
            <div className="p-3 sm:p-3.5 rounded-[18px] bg-secondary/40 dark:bg-white/[0.03] border border-border/50 flex flex-col justify-between gap-2 transition-all hover:bg-secondary/60">
              <div className="flex items-center gap-2 select-none">
                <div className="w-6 h-6 rounded-[8px] bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-muted-foreground text-[11px] font-medium truncate">
                  {t("dashboard.expire_time")}
                </span>
              </div>
              <span className="font-medium text-foreground text-[13px] sm:text-[14px] block truncate">
                {user.expired_at ? formatDate(user.expired_at) : t("dashboard.never_expire")}
              </span>
            </div>

            {/* 4. 账户余额 (Balance) */}
            <div className="p-3 sm:p-3.5 rounded-[18px] bg-secondary/40 dark:bg-white/[0.03] border border-border/50 flex flex-col justify-between gap-2 transition-all hover:bg-secondary/60">
              <div className="flex items-center gap-2 select-none">
                <div className="w-6 h-6 rounded-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <span className="text-muted-foreground text-[11px] font-medium truncate">
                  {t("dashboard.balance")}
                </span>
              </div>
              <span className="font-semibold text-foreground text-[14px] sm:text-[15px] block truncate">
                <span className="select-none font-mono">¥ </span>{((user.balance || 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Card Actions: Symmetric iOS 26 Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-4 border-t border-border/60">
          {subscribe?.subscribe_url ? (
            <>
              <button
                type="button"
                onClick={() => openQuickImportDialog(subscribe.subscribe_url, t)}
                className="h-11 w-full rounded-full bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs font-medium text-[13px] sm:text-sm transition-all duration-200 ios-touch-feedback active:scale-[0.98] cursor-pointer select-none px-3"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span className="truncate">{t("dashboard.quick_import")}</span>
              </button>

              <AppleCopyButton
                textToCopy={subscribe.subscribe_url}
                defaultText={t("dashboard.copy_subscription")}
                copiedText={t("common.copied")}
                variant="secondary"
                className="h-11 w-full rounded-full border border-border/80 bg-secondary/60 hover:bg-secondary font-medium text-[13px] sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 ios-touch-feedback active:scale-[0.98] cursor-pointer select-none px-3"
              />
            </>
          ) : (
            <Link href={`/${locale}/shop`} className="col-span-2">
              <button
                type="button"
                className="h-11 w-full rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white flex items-center justify-center gap-2 shadow-sm font-medium text-sm transition-all duration-200 ios-touch-feedback active:scale-[0.98] cursor-pointer select-none"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t("dashboard.buy_plan_cta")}</span>
              </button>
            </Link>
          )}
        </div>
      </section>


      {/* 4. Complete Node Servers & Traffic Log Section (Merged into Dashboard) */}
      <section id="nodes" className="space-y-4 pt-2 scroll-mt-20">
        {/* iOS 26 Liquid Glass Segmented Control */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-1">
          <div className="relative inline-flex rounded-full liquid-glass-segment-dock select-none">
            {/* Sliding Liquid Active Indicator Pill */}
            <div
              className="liquid-glass-segment-active"
              style={{
                width: "calc((100% - 7px) / 2)",
                left: "3.5px",
                transform: `translateX(${dashboardTab === "nodes" ? "0%" : "100%"})`,
              }}
            />
            <button
              type="button"
              onClick={() => setDashboardTab("nodes")}
              className={cn(
                "relative z-10 px-5 sm:px-6 py-1.5 rounded-full text-xs font-medium transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 ios-touch-feedback min-w-[150px] sm:min-w-[162px]",
                dashboardTab === "nodes"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Radio className={cn("w-3.5 h-3.5 transition-colors", dashboardTab === "nodes" ? "text-[#0071e3] dark:text-[#2997ff]" : "")} />
              <span>{t("traffic.tab_nodes")}</span>
              <span className="text-[10px] font-mono opacity-80">({servers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardTab("traffic")}
              className={cn(
                "relative z-10 px-5 sm:px-6 py-1.5 rounded-full text-xs font-medium transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 ios-touch-feedback min-w-[150px] sm:min-w-[162px]",
                dashboardTab === "traffic"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Activity className={cn("w-3.5 h-3.5 transition-colors", dashboardTab === "traffic" ? "text-[#0071e3] dark:text-[#2997ff]" : "")} />
              <span>{t("traffic.tab_traffic")}</span>
            </button>
          </div>

          {/* Search Bar on Nodes Tab */}
          {dashboardTab === "nodes" && servers && servers.length > 0 && (
            <div className="relative w-full sm:w-64 animate-fade-in-gradient">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none select-none" />
              <input
                value={nodeSearch}
                onChange={(e) => setNodeSearch(e.target.value)}
                placeholder={t("nodes.search_placeholder")}
                className="w-full h-8.5 pl-9 pr-20 rounded-full bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border border-white/60 dark:border-white/15 text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:border-[#0071e3] transition-all shadow-2xs"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {nodeSearch && (
                  <button
                    type="button"
                    onClick={() => setNodeSearch("")}
                    className="w-4 h-4 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-full border border-border/60 select-none">
                  {filteredServers.length}/{servers.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {dashboardTab === "nodes" ? (
          <div key="nodes-content-view" className="space-y-4 animate-fade-in-gradient">
            {/* Dynamic Type Filter Chips - Native Horizontal Momentum Scroll */}
            {availableNodeTypes.length > 2 && (
              <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 animate-fade-in-gradient">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 select-none">
                  {availableNodeTypes.map((type) => {
                    const isSelected = selectedNodeType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedNodeType(type)}
                        className={`apple-pill-btn shrink-0 whitespace-nowrap text-xs px-3 py-1.5 transition-all select-none ${
                          isSelected
                            ? "bg-gradient-to-r from-[#0071e3] to-[#0066cc] text-white font-medium shadow-xs shadow-[#0066cc]/25 border-transparent"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        }`}
                      >
                        {type === "all" ? t("nodes.all_types") : type}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nodes Grid (Real data only) */}
            {servers && servers.length > 0 ? (
              filteredServers.length > 0 ? (
                <div
                  key={`nodes-grid-${selectedNodeType}-${nodeSearch}`}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
                >
                  {filteredServers.map((server, idx) => (
                    <div
                      key={server.id}
                      className="apple-utility-card flex flex-col justify-between space-y-3.5 hover:border-[#0066cc]/40 transition-all animate-fade-in-gradient"
                      style={{ animationDelay: `${Math.min(idx * 35, 280)}ms` }}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0 flex-1">
                            <h3 className="text-[14.5px] font-semibold apple-headline text-foreground truncate">
                              {server.name}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border select-none">
                                {server.type}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border select-none">
                                {t("nodes.rate", { rate: server.rate || "1.0" })}
                              </span>
                            </div>
                          </div>

                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1 select-none animate-pulse" />
                        </div>
                      </div>

                      {/* Actions: QR connect dialog + copy link */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-border/60 text-xs">
                        <button
                          type="button"
                          onClick={() => showQrDialog(server)}
                          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#0066cc] dark:hover:text-[#2997ff] transition-colors select-none cursor-pointer"
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
                          className="px-2.5 h-6.5 shrink-0 text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="apple-utility-card py-12 text-center space-y-2 animate-fade-in-gradient">
                  <Globe className="w-7 h-7 text-muted-foreground mx-auto opacity-40" />
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("nodes.empty")}</p>
                </div>
              )
            ) : (
              <div className="p-8 rounded-[18px] border border-border bg-card text-center text-xs text-muted-foreground animate-fade-in-gradient">
                {authenticated
                  ? t("nodes.empty")
                  : "登录后即可查看已分配的节点服务器"}
              </div>
            )}
          </div>
        ) : (
          /* Traffic Logs View (Merged) */
          <div key="traffic-content-view" className="space-y-3.5 animate-fade-in-gradient">
            {/* Info notice pill */}
            <div className="p-3.5 rounded-[18px] border border-[#0071e3]/20 bg-[#0071e3]/5 dark:bg-[#0071e3]/10 flex items-center gap-2.5 text-xs text-[#0071e3] dark:text-[#2997ff] select-none animate-fade-in-gradient">
              <Info className="w-4 h-4 shrink-0" />
              <span>{t("traffic.retention_notice")}</span>
            </div>

            {trafficLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground animate-fade-in-gradient">
                <Loader2 className="w-5 h-5 animate-spin text-[#0071e3]" />
                <span className="text-xs">{t("common.loading")}</span>
              </div>
            ) : trafficLogs.length === 0 ? (
              <div className="apple-utility-card py-12 text-center space-y-2 animate-fade-in-gradient">
                <Activity className="w-7 h-7 text-muted-foreground mx-auto opacity-40" />
                <p className="text-xs sm:text-sm text-muted-foreground">{t("traffic.empty")}</p>
              </div>
            ) : (
              <>
                {/* Desktop Responsive Table */}
                <div className="hidden sm:block rounded-[22px] border border-border/80 bg-card overflow-hidden shadow-xs animate-fade-in-gradient">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 bg-secondary/30 text-muted-foreground select-none">
                        <th className="py-3 px-4.5 font-semibold">{t("traffic.record_time")}</th>
                        <th className="py-3 px-4.5 font-semibold">{t("traffic.actual_upload")}</th>
                        <th className="py-3 px-4.5 font-semibold">{t("traffic.actual_download")}</th>
                        <th className="py-3 px-4.5 font-semibold text-center">{t("traffic.billing_rate")}</th>
                        <th className="py-3 px-4.5 font-semibold text-right">{t("traffic.total_traffic")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-mono">
                      {trafficLogs.map((log, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-secondary/20 transition-colors animate-fade-in-gradient"
                          style={{ animationDelay: `${Math.min(idx * 25, 250)}ms` }}
                        >
                          <td className="py-3.5 px-4.5 text-foreground font-medium">{String(log.record_at)}</td>
                          <td className="py-3.5 px-4.5 text-emerald-600 dark:text-emerald-400">
                            <div className="flex items-center gap-1.5">
                              <ArrowUp className="w-3 h-3 shrink-0" />
                              <span>{formatBytes(log.u)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4.5 text-[#0066cc] dark:text-[#2997ff]">
                            <div className="flex items-center gap-1.5">
                              <ArrowDown className="w-3 h-3 shrink-0" />
                              <span>{formatBytes(log.d)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4.5 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px] border border-border/60 select-none">
                              {log.server_rate || `${log.rate || 1}x`}
                            </span>
                          </td>
                          <td className="py-3.5 px-4.5 text-right font-semibold text-foreground">
                            {formatBytes(log.total || (log.u + log.d))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="sm:hidden space-y-2.5">
                  {trafficLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[18px] border border-border/80 bg-card space-y-2.5 shadow-2xs animate-fade-in-gradient"
                      style={{ animationDelay: `${Math.min(idx * 35, 280)}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground font-mono">{String(log.record_at)}</span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-mono border border-border/60 select-none">
                          {log.server_rate || `${log.rate || 1}x`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                          <ArrowUp className="w-3 h-3 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground block font-sans">{t("traffic.actual_upload")}</span>
                            <span className="font-semibold truncate block">{formatBytes(log.u)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#0066cc] dark:text-[#2997ff] bg-[#0066cc]/5 p-2 rounded-xl border border-[#0066cc]/10">
                          <ArrowDown className="w-3 h-3 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground block font-sans">{t("traffic.actual_download")}</span>
                            <span className="font-semibold truncate block">{formatBytes(log.d)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 font-mono">
                        <span className="text-muted-foreground text-[11px] font-sans">{t("traffic.total_traffic")}</span>
                        <span className="font-bold text-foreground">{formatBytes(log.total || (log.u + log.d))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}