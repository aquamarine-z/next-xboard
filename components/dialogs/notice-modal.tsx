"use client";

import * as React from "react";
import { Bell, X, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { ArticleRenderer } from "@/components/ui/article-renderer";
import { cn } from "@/lib/utils";
import type { XboardNotice } from "@/types/xboard";

export interface NoticeModalProps {
  notices: XboardNotice[];
  readNoticeIds: number[];
  onMarkRead: (id: number) => void;
  onAcknowledgeAll: () => void;
  t: (key: string, params?: Record<string, any>) => string;
  formatDate: (timestampInSeconds: number) => string;
  close: () => void | Promise<void>;
}

// Global snippet cache to prevent expensive regex re-parsing during list scrolls
const snippetCache = new Map<string, string>();

/**
 * Strips HTML & Markdown syntax to generate a clean 2-line plain text snippet for iOS Mail list item preview
 */
function getNoticeSnippet(content: string, maxLen = 80): string {
  if (!content) return "";
  const cacheKey = content.length > 150 ? content.slice(0, 150) : content;
  if (snippetCache.has(cacheKey)) {
    return snippetCache.get(cacheKey)!;
  }

  let text = content.replace(/<[^>]*>?/gm, " ");
  text = text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[*_~>|#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const res = text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
  snippetCache.set(cacheKey, res);
  return res;
}

/**
 * Formats timestamp to Apple Mail style date (e.g. "11:20" if today, "昨天" if yesterday, or "M/D" / "YYYY/M/D")
 */
function formatMailDate(timestampInSeconds: number, fallback: string): string {
  if (!timestampInSeconds) return fallback;
  const d = new Date(timestampInSeconds * 1000);
  const now = new Date();

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "昨天";
  }

  const isSameYear = d.getFullYear() === now.getFullYear();
  if (isSameYear) {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function NoticeModal({
  notices: initialNotices,
  readNoticeIds: initialReadIds,
  onMarkRead,
  onAcknowledgeAll,
  t,
  formatDate,
  close,
}: NoticeModalProps) {
  const [readIds, setReadIds] = React.useState<number[]>(initialReadIds);

  // Paginated notices state for smooth scroll-down loading ("下拉加载更多")
  const [items, setItems] = React.useState<XboardNotice[]>(initialNotices);
  const [page, setPage] = React.useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
  const [hasMore, setHasMore] = React.useState<boolean>(() => initialNotices.length >= 5);
  const [totalCount, setTotalCount] = React.useState<number>(initialNotices.length);

  // Detail lazy rendering & transition state to prevent UI freeze/lag during mobile slide animation
  const [isDetailReady, setIsDetailReady] = React.useState<boolean>(true);
  const [, startTransition] = React.useTransition();

  // Responsive desktop detection (threshold: 1024px)
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Selected Notice ID (Desktop defaults to first notice; Mobile defaults to null to clear selection)
  const [selectedId, setSelectedId] = React.useState<number | null>(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      const firstUnread = initialNotices.find((n) => !initialReadIds.includes(n.id));
      return firstUnread ? firstUnread.id : (initialNotices[0]?.id ?? null);
    }
    return null;
  });

  // Mobile navigation state: "list" or "detail" view
  const [mobileView, setMobileView] = React.useState<"list" | "detail">("list");

  // Keep items synced if prop notices updates
  React.useEffect(() => {
    if (initialNotices && initialNotices.length > 0) {
      setItems((prev) => {
        const prevIds = new Set(prev.map((n) => n.id));
        const additions = initialNotices.filter((n) => !prevIds.has(n.id));
        return additions.length > 0 ? [...prev, ...additions] : prev;
      });
      setTotalCount((prev) => Math.max(prev, initialNotices.length));
    }
  }, [initialNotices]);

  // Track window resizing across 1024px boundary
  React.useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When transitioning to PC/Desktop, automatically select the first notice if none is selected
  // When transitioning to Mobile in list view, automatically clear the selection
  React.useEffect(() => {
    if (isDesktop) {
      if (!selectedId || !items.some((n) => n.id === selectedId)) {
        const first = items[0]?.id ?? null;
        if (first) {
          setSelectedId(first);
        }
      }
    } else {
      if (mobileView === "list") {
        setSelectedId(null);
      }
    }
  }, [isDesktop, mobileView, selectedId, items]);

  // Swipe-to-back gesture detection on mobile
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaX > 50 && Math.abs(deltaY) < 60 && mobileView === "detail") {
      setMobileView("list");
      setSelectedId(null); // Clear selection when returning to list on mobile
    }
  };

  // Mark currently active notice as read on selection
  React.useEffect(() => {
    if (selectedId && !readIds.includes(selectedId)) {
      setReadIds((prev) => [...prev, selectedId]);
      onMarkRead(selectedId);
    }
  }, [selectedId, readIds, onMarkRead]);

  // Selected Notice and Next Notice for smooth downstream reading
  const activeNotice =
    (selectedId ? items.find((n) => n.id === selectedId) : null) ||
    (isDesktop ? items[0] : null) ||
    null;

  const activeIndex = activeNotice ? items.findIndex((n) => n.id === activeNotice.id) : -1;
  const nextNotice = activeIndex >= 0 && activeIndex < items.length - 1 ? items[activeIndex + 1] : null;

  // Select notice with deferred detail rendering to keep mobile 300ms slide at 60 FPS
  const handleSelectNotice = React.useCallback(
    (id: number) => {
      setSelectedId(id);
      setMobileView("detail");
      if (!readIds.includes(id)) {
        setReadIds((prev) => [...prev, id]);
        onMarkRead(id);
      }

      // Defer Markdown parsing by 160ms so sliding animation stays completely smooth
      setIsDetailReady(false);
      setTimeout(() => {
        startTransition(() => {
          setIsDetailReady(true);
        });
      }, 160);
    },
    [readIds, onMarkRead]
  );

  const handleBackToList = () => {
    setMobileView("list");
    setSelectedId(null);
  };

  const handleAcknowledge = () => {
    onAcknowledgeAll();
    void close();
  };

  // Scroll-down pagination handler: loads more notices when scrolling near the bottom of the list
  const loadMoreNotices = React.useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/xboard?type=notices&current=${nextPage}`);
      if (res.ok) {
        const json = await res.json();
        const newItems: XboardNotice[] = Array.isArray(json) ? json : json.data || [];
        const total = typeof json.total === "number" ? json.total : undefined;

        if (total !== undefined) {
          setTotalCount(total);
        }

        if (newItems.length > 0) {
          setItems((prev) => {
            const seen = new Set(prev.map((n) => n.id));
            const additions = newItems.filter((n) => !seen.has(n.id));
            return [...prev, ...additions];
          });
          setPage(nextPage);

          if (
            newItems.length < 5 ||
            (total !== undefined && items.length + newItems.length >= total)
          ) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more notices:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore, items.length]);

  const handleListScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      // Trigger when within 70px of the bottom
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 70) {
        if (!isLoadingMore && hasMore) {
          void loadMoreNotices();
        }
      }
    },
    [isLoadingMore, hasMore, loadMoreNotices]
  );

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden w-full max-w-[92vw] lg:max-w-[880px] lg:w-[880px] h-[85vh] lg:h-[580px] rounded-[28px] lg:rounded-[32px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl ios26-glass-modal outline-none flex flex-col select-none"
    >
      {/* 1. iOS 26 Modal Header */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/60 flex items-center justify-between select-none bg-secondary/15 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 text-[#0066cc] dark:text-[#2997ff] border border-[#0071e3]/20 flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-4 h-4" />
          </div>

          <h2 className="text-base sm:text-lg font-semibold apple-headline text-foreground tracking-tight truncate">
            <span className="hidden lg:inline">{t("notices.modal_title")}</span>
            <span className="lg:hidden">
              {mobileView === "detail" ? t("notices.detail") : t("notices.modal_title")}
            </span>
          </h2>
        </div>

        {/* Circular iOS Close Button */}
        <button
          type="button"
          onClick={() => void close()}
          className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Split Body with Silky Smooth Sliding Transition on Mobile/Tablet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 min-h-0 overflow-hidden relative"
      >
        <div
          className={cn(
            "w-full h-full flex transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "lg:transform-none lg:transition-none lg:flex-row lg:divide-x lg:divide-border/60",
            mobileView === "detail" ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
          )}
        >
          {/* Left Column: iOS Mail Style Notices Navigation List with Scroll-Down Pagination */}
          <div
            onScroll={handleListScroll}
            className="w-full lg:w-[290px] shrink-0 p-3 sm:p-3.5 space-y-2.5 overflow-y-auto h-full no-scrollbar bg-black/[0.02] dark:bg-white/[0.02]"
          >
            {items.length > 0 ? (
              items.map((notice) => {
                const isSelected = activeNotice?.id === notice.id;
                const isRead = readIds.includes(notice.id);

                return (
                  <button
                    key={notice.id}
                    type="button"
                    onClick={() => handleSelectNotice(notice.id)}
                    className={cn(
                      "w-full text-left p-3 sm:p-3.5 rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-card hover:bg-black/[0.02] dark:hover:bg-white/[0.04] active:bg-black/[0.04] dark:active:bg-white/[0.06] transition-all relative select-none cursor-pointer flex flex-col gap-1.5 group ios-touch-feedback",
                      // Blue highlight ONLY applies on Desktop (lg:) when selected; Mobile NEVER has the blue highlight
                      isSelected &&
                        "lg:border-[#0071e3]/45 lg:dark:border-[#2997ff]/45 lg:bg-[#0071e3]/[0.08] lg:dark:bg-[#2997ff]/15 lg:shadow-2xs lg:ring-1 lg:ring-[#0071e3]/20"
                    )}
                  >
                    {/* Row 1: iOS Mail Unread Dot + Subject Title + Date */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* iOS Mail Blue Dot */}
                        {!isRead ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] dark:bg-[#2997ff] shrink-0 ring-2 ring-card animate-pulse" />
                        ) : (
                          <span className="w-2.5 h-2.5 shrink-0 opacity-0" />
                        )}
                        <h4
                          className={cn(
                            "text-[13px] sm:text-[13.5px] tracking-tight truncate leading-tight",
                            !isRead
                              ? "font-bold text-foreground"
                              : "font-semibold text-foreground/85 group-hover:text-foreground"
                          )}
                        >
                          {notice.title}
                        </h4>
                      </div>

                      <span className="text-[11px] font-mono text-muted-foreground/80 shrink-0 select-none">
                        {formatMailDate(notice.created_at, formatDate(notice.created_at))}
                      </span>
                    </div>

                    {/* Row 2: Apple Mail Snippet Preview (Indented to align under title text) */}
                    <div className="flex items-center justify-between gap-2 pl-[18px]">
                      <p className="text-xs text-muted-foreground/75 dark:text-muted-foreground/70 line-clamp-2 leading-relaxed font-sans select-none flex-1">
                        {getNoticeSnippet(notice.content) || notice.title}
                      </p>
                      {/* Mobile indicator chevron */}
                      <span className="lg:hidden text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 self-center">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-20 text-center text-muted-foreground text-xs select-none">
                {t("notices.empty")}
              </div>
            )}

            {/* Bottom Indicator for Scroll-Down Pagination ("下拉加载更多") */}
            {isLoadingMore && (
              <div className="py-3 flex items-center justify-center gap-2 text-xs text-muted-foreground select-none">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0071e3] dark:text-[#2997ff]" />
                <span>{t("notices.loading_more") || "正在加载更多公告..."}</span>
              </div>
            )}

            {!hasMore && items.length > 5 && (
              <div className="py-2.5 text-center text-[11px] text-muted-foreground/60 select-none">
                {t("notices.no_more") || "已加载全部公告"}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Notice Content (Page 2 on Mobile/Tablet) with Shimmer Skeleton */}
          <div className="w-full lg:flex-1 shrink-0 lg:shrink p-4 sm:p-7 overflow-y-auto h-full flex flex-col justify-between space-y-4 bg-card/60 dark:bg-transparent">
            {activeNotice ? (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* Meta Header */}
                <div className="space-y-1.5 pb-3 border-b border-border/60 shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground font-medium select-none">
                      {t("notices.archive_total", { count: totalCount })}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-2xl font-bold apple-headline text-foreground tracking-tight leading-snug">
                    {activeNotice.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono select-none">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span>{formatDate(activeNotice.created_at)}</span>
                  </div>
                </div>

                {/* Notice Body: Markdown with Smooth Skeleton to Prevent Stutter */}
                <div className="flex-1 overflow-y-auto pr-1 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans select-text">
                  {!isDetailReady ? (
                    <div className="space-y-4 py-2 animate-pulse select-none">
                      <div className="h-3.5 w-3/4 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                      <div className="h-3.5 w-full bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                      <div className="h-3.5 w-5/6 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                      <div className="h-3.5 w-2/3 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                      <div className="h-28 w-full bg-black/[0.04] dark:bg-white/[0.05] rounded-2xl mt-4" />
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-200">
                      <ArticleRenderer content={activeNotice.content} />
                    </div>
                  )}

                  {/* Bottom of Detail: Quick Jump to Next Notice ("下拉查看下一篇") */}
                  {nextNotice && (
                    <div className="pt-6 mt-6 border-t border-border/50 select-none">
                      <div className="text-[11px] font-medium text-muted-foreground/80 mb-2">
                        {t("notices.next_notice") || "下一条公告"}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectNotice(nextNotice.id)}
                        className="w-full text-left p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:bg-black/[0.07] dark:active:bg-white/[0.09] border border-black/[0.05] dark:border-white/[0.08] transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <h5 className="text-xs font-semibold text-foreground truncate group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors">
                            {nextNotice.title}
                          </h5>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-sans">
                            {getNoticeSnippet(nextNotice.content)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-muted-foreground text-xs sm:text-sm flex flex-col items-center justify-center space-y-2 select-none h-full">
                <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground mb-1">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <p className="font-medium text-foreground/80">{t("notices.empty")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. iOS 26 Modal Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-border/60 flex items-center justify-end bg-secondary/15 select-none shrink-0">
        {/* Mobile Detail / Reading Mode: "返回列表" */}
        {mobileView === "detail" && (
          <button
            type="button"
            onClick={handleBackToList}
            className="flex lg:hidden apple-pill-btn bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] active:from-[#005bb5] active:to-[#004c99] text-white px-6 py-2.5 text-xs font-semibold rounded-full shadow-xs shadow-[#0066cc]/25 cursor-pointer ios-touch-feedback active:scale-[0.98]"
          >
            {t("notices.back_to_list")}
          </button>
        )}

        {/* Desktop Always / Mobile List Mode: "我知道了" */}
        <button
          type="button"
          onClick={handleAcknowledge}
          className={cn(
            "apple-pill-btn bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] active:from-[#005bb5] active:to-[#004c99] text-white px-6 py-2.5 text-xs font-semibold rounded-full shadow-xs shadow-[#0066cc]/25 cursor-pointer ios-touch-feedback active:scale-[0.98]",
            mobileView === "detail" ? "hidden lg:flex" : "flex"
          )}
        >
          {t("notices.acknowledge")}
        </button>
      </div>
    </SurfaceDialogContent>
  );
}

export function openNoticeDialog(params: {
  notices: XboardNotice[];
  readNoticeIds: number[];
  onMarkRead: (id: number) => void;
  onAcknowledgeAll: () => void;
  t: (key: string, params?: Record<string, any>) => string;
  formatDate: (timestampInSeconds: number) => string;
}) {
  return dialog.custom((close) => (
    <NoticeModal
      notices={params.notices}
      readNoticeIds={params.readNoticeIds}
      onMarkRead={params.onMarkRead}
      onAcknowledgeAll={params.onAcknowledgeAll}
      t={params.t}
      formatDate={params.formatDate}
      close={close}
    />
  ));
}
