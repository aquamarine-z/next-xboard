"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { formatDate } from "@/lib/format";
import type { XboardKnowledge } from "@/types/xboard";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
import { ArticleRenderer } from "@/components/ui/article-renderer";
import { DEFAULT_KNOWLEDGE_ARTICLES } from "@/lib/default-knowledge";
import {
  BookOpen,
  Search,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  X,
} from "lucide-react";

export default function KnowledgePage() {
  const { t } = useTranslation();
  const { fetchDashboardData } = useUserStore();

  const [articles, setArticles] = React.useState<XboardKnowledge[]>(DEFAULT_KNOWLEDGE_ARTICLES);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [activeArticle, setActiveArticle] = React.useState<XboardKnowledge | null>(null);
  const [articleLoading, setArticleLoading] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch knowledge base list
  const fetchArticles = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/xboard?type=knowledge");
      if (!res.ok) throw new Error("Failed to fetch knowledge");
      const data = await res.json();

      let list: XboardKnowledge[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (typeof data === "object" && data !== null) {
        Object.entries(data).forEach(([cat, items]) => {
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              list.push({ ...item, category: item.category || cat });
            });
          }
        });
      }
      if (list.length > 0) {
        setArticles(list);
      } else {
        setArticles(DEFAULT_KNOWLEDGE_ARTICLES);
      }
    } catch (err) {
      console.error("Error fetching knowledge base:", err);
      setArticles(DEFAULT_KNOWLEDGE_ARTICLES);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Open article
  const handleOpenArticle = async (article: XboardKnowledge) => {
    setClosing(false);
    setActiveArticle(article);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (article.body && article.body.length > 20) {
      return;
    }

    setArticleLoading(true);
    try {
      const res = await fetch(`/api/xboard?type=knowledge&id=${article.id}`);
      if (res.ok) {
        const fullData = await res.json();
        if (fullData && (fullData.body || fullData.content)) {
          setActiveArticle({
            ...article,
            body: fullData.body || fullData.content,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching article body:", err);
    } finally {
      setArticleLoading(false);
    }
  };

  // Close article with smooth fade
  const handleCloseArticle = () => {
    setClosing(true);
    setTimeout(() => {
      setActiveArticle(null);
      setClosing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 220);
  };

  // Derive unique categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    articles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [articles]);

  // Filtered articles list
  const filteredArticles = React.useMemo(() => {
    return articles.filter((a) => {
      const matchesCat =
        selectedCategory === "all" || a.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        a.title.toLowerCase().includes(query) ||
        (a.category && a.category.toLowerCase().includes(query)) ||
        (a.body && a.body.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Group filtered articles by sub-category for partitioned "All" view
  const categorizedGroups = React.useMemo(() => {
    const map = new Map<string, XboardKnowledge[]>();
    categories.forEach((cat) => map.set(cat, []));
    const uncategorized: XboardKnowledge[] = [];

    filteredArticles.forEach((article) => {
      const cat = article.category?.trim();
      if (cat && map.has(cat)) {
        map.get(cat)!.push(article);
      } else if (cat) {
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat)!.push(article);
      } else {
        uncategorized.push(article);
      }
    });

    const groups: { category: string; articles: XboardKnowledge[] }[] = [];
    map.forEach((items, cat) => {
      if (items.length > 0) {
        groups.push({ category: cat, articles: items });
      }
    });
    if (uncategorized.length > 0) {
      groups.push({
        category: t("knowledge.other_category"),
        articles: uncategorized,
      });
    }
    return groups;
  }, [categories, filteredArticles, t]);

  // Reading time estimate
  const estimateReadingTime = (text?: string) => {
    if (!text) return 2;
    const words = text.length;
    return Math.max(1, Math.ceil(words / 400));
  };

  return (
    <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300">
      {/* 1. Top Section / Navigation Affordance */}
      {activeArticle ? (
        <div
          className={`flex items-center justify-between gap-4 pb-2 border-b border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 ${
            closing ? "opacity-0 -translate-y-1" : "animate-in fade-in duration-300"
          }`}
        >
          <button
            type="button"
            onClick={handleCloseArticle}
            className="apple-pill-btn bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-foreground text-xs sm:text-sm font-medium flex items-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("knowledge.back_to_list")}</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[11px] font-medium text-muted-foreground">
            {activeArticle.category || t("knowledge.category")}
          </span>
        </div>
      ) : (
        <div className="space-y-1.5 animate-in fade-in duration-300">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] apple-headline text-foreground">
            {t("knowledge.title")}
          </h1>
          <p className="text-[14px] text-muted-foreground font-normal">
            {t("knowledge.subtitle")}
          </p>
        </div>
      )}

      {/* 2. Reader View */}
      {activeArticle ? (
        <article
          className={`relative overflow-hidden rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-card p-6 sm:p-10 md:p-12 space-y-8 shadow-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            closing
              ? "opacity-0 translate-y-3 scale-[0.99]"
              : "animate-in fade-in slide-in-from-bottom-4 duration-300"
          }`}
        >
          {/* Article Header */}
          <div className="relative z-10 space-y-4 pb-6 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] font-medium">
                <Tag className="w-3 h-3" />
                <span>{activeArticle.category || t("knowledge.category")}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {t("knowledge.updated_at", {
                    date: formatDate(activeArticle.updated_at || activeArticle.created_at || Date.now() / 1000),
                  })}
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {t("knowledge.reading_time", {
                    minutes: estimateReadingTime(activeArticle.body),
                  })}
                </span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.02em] apple-headline text-foreground leading-tight">
              {activeArticle.title}
            </h2>
          </div>

          {/* Article Content */}
          {articleLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-7 h-7 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                {t("knowledge.loading")}
              </p>
            </div>
          ) : (
            <div className="relative z-10 max-w-none text-foreground/90 space-y-5 leading-[1.75] text-[15px] sm:text-[16px]">
              {activeArticle.body ? (
                <ArticleRenderer content={activeArticle.body} />
              ) : (
                <div className="p-8 rounded-[18px] bg-secondary/40 border border-border text-center text-xs text-muted-foreground">
                  {t("knowledge.empty")}
                </div>
              )}
            </div>
          )}

          {/* Article Footer */}
          <div className="relative z-10 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
            <button
              type="button"
              onClick={handleCloseArticle}
              className="hover:text-foreground font-medium flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("knowledge.back_to_list")}</span>
            </button>
            <span className="font-mono text-[11px] opacity-75">Aqua VPS Documentation</span>
          </div>
        </article>
      ) : (
        /* 3. Knowledge Directory List View */
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {/* Controls: Search & Horizontally Scrollable Category Capsules */}
          <div className="space-y-3.5 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              {/* Search Input with Apple Frosted Capsule */}
              <div className="relative w-full sm:max-w-xs md:max-w-sm">
                <div className="h-10.5 rounded-full bg-secondary/70 dark:bg-white/[0.06] border border-border/70 backdrop-blur-md flex items-center pl-3.5 pr-2.5 focus-within:ring-2 focus-within:ring-[#0066cc]/25 focus-within:border-[#0066cc] transition-all shadow-2xs">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0 opacity-75" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("knowledge.search_placeholder")}
                    className="w-full bg-transparent border-0 text-[13px] sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none pl-2.5 pr-1"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Document count summary */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground select-none">
                <BookOpen className="w-3.5 h-3.5 opacity-60" />
                <span>
                  {articles.length} {t("knowledge.title")}
                </span>
              </div>
            </div>

            {/* Category Filter Capsules: Smooth Horizontal Scroll with Bleed on Mobile */}
            {categories.length > 0 && (
              <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 select-none">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`apple-pill-btn px-3.5 py-1.5 text-xs sm:text-[13px] rounded-full shrink-0 transition-all duration-200 ios-touch-feedback active:scale-95 flex items-center cursor-pointer ${
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-[#0071e3] to-[#0066cc] text-white font-medium shadow-xs shadow-[#0066cc]/30 border border-transparent"
                        : "bg-secondary/65 hover:bg-secondary dark:bg-white/[0.05] dark:hover:bg-white/[0.09] text-muted-foreground hover:text-foreground border border-border/50 font-normal"
                    }`}
                  >
                    <span>{t("knowledge.all_categories")}</span>
                    <span className="opacity-75 text-[11px] ml-1 font-mono">({articles.length})</span>
                  </button>
                  {categories.map((cat) => {
                    const count = articles.filter((a) => a.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`apple-pill-btn px-3.5 py-1.5 text-xs sm:text-[13px] rounded-full shrink-0 transition-all duration-200 ios-touch-feedback active:scale-95 flex items-center cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-gradient-to-r from-[#0071e3] to-[#0066cc] text-white font-medium shadow-xs shadow-[#0066cc]/30 border border-transparent"
                            : "bg-secondary/65 hover:bg-secondary dark:bg-white/[0.05] dark:hover:bg-white/[0.09] text-muted-foreground hover:text-foreground border border-border/50 font-normal"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="opacity-75 text-[11px] ml-1 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Articles Section: Partitioned into Zones when "all", or Single Category View */}
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-7 h-7 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                {t("knowledge.loading")}
              </p>
            </div>
          ) : filteredArticles.length > 0 ? (
            selectedCategory === "all" ? (
              /* Zoned View: Each Sub-Category Partitioned Into Separate Zone */
              <div className="space-y-10 sm:space-y-12">
                {categorizedGroups.map((group) => (
                  <section key={group.category} className="space-y-4">
                    {/* Zone Section Header */}
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08] select-none">
                      <div className="w-6 h-6 rounded-[6px] border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] text-foreground/80 flex items-center justify-center shrink-0 shadow-2xs">
                        <Tag className="w-3 h-3 select-none" />
                      </div>
                      <h3 className="text-[15px] sm:text-[17px] font-semibold tracking-tight apple-headline text-foreground">
                        {group.category}
                      </h3>
                      <span className="text-[11px] font-mono text-muted-foreground/80 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] px-2 py-0.5 rounded-full select-none">
                        {group.articles.length}
                      </span>
                    </div>

                    {/* Zone Articles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {group.articles.map((article) => (
                        <div
                          key={article.id}
                          onClick={() => handleOpenArticle(article)}
                          className="p-6 sm:p-7 rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] bg-card hover:border-[#0066cc]/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 select-none">
                              <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-medium text-muted-foreground select-none">
                                {article.category || t("knowledge.category")}
                              </span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono select-none">
                                <Clock className="w-3 h-3 opacity-60 select-none" />
                                <span className="select-none">{estimateReadingTime(article.body)} min</span>
                              </span>
                            </div>

                            <h4 className="text-[16px] sm:text-[17px] font-semibold tracking-[-0.015em] text-foreground group-hover:text-[#0066cc] dark:group-hover:text-[#2997ff] transition-colors line-clamp-2 leading-snug">
                              {article.title}
                            </h4>

                            {article.body && (
                              <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                                {article.body.replace(/[#*`_\[\]]/g, "").slice(0, 110)}
                              </p>
                            )}
                          </div>

                          <div className="pt-4 mt-4 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground select-none">
                            <span className="font-mono text-[11px] opacity-75">
                              {formatDate(
                                article.updated_at || article.created_at || Date.now() / 1000
                              )}
                            </span>
                            <span className="font-medium text-[#0066cc] dark:text-[#2997ff] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                              <span>{t("knowledge.read_article")}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* Single Filtered Category View */
              <div className="space-y-4">
                {/* Header with return affordance */}
                <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08] select-none">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-[6px] border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] text-foreground/80 flex items-center justify-center shrink-0 shadow-2xs">
                      <Tag className="w-3.5 h-3.5 select-none" />
                    </div>
                    <h3 className="text-[15px] sm:text-[17px] font-semibold tracking-tight apple-headline text-foreground">
                      {selectedCategory}
                    </h3>
                    <span className="text-[11px] font-mono text-muted-foreground/80 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] px-2 py-0.5 rounded-full select-none">
                      {filteredArticles.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("all");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors select-none cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 opacity-70" />
                    <span>{t("knowledge.all_categories")}</span>
                  </button>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleOpenArticle(article)}
                      className="p-6 sm:p-7 rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] bg-card hover:border-[#0066cc]/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 select-none">
                          <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-medium text-muted-foreground select-none">
                            {article.category || t("knowledge.category")}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono select-none">
                            <Clock className="w-3 h-3 opacity-60 select-none" />
                            <span className="select-none">{estimateReadingTime(article.body)} min</span>
                          </span>
                        </div>

                        <h3 className="text-[16px] sm:text-[17px] font-semibold tracking-[-0.015em] text-foreground group-hover:text-[#0066cc] dark:group-hover:text-[#2997ff] transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h3>

                        {article.body && (
                          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                            {article.body.replace(/[#*`_\[\]]/g, "").slice(0, 110)}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground select-none">
                        <span className="font-mono text-[11px] opacity-75">
                          {formatDate(
                            article.updated_at || article.created_at || Date.now() / 1000
                          )}
                        </span>
                        <span className="font-medium text-[#0066cc] dark:text-[#2997ff] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                          <span>{t("knowledge.read_article")}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="p-14 sm:p-20 rounded-[24px] border border-dashed border-black/[0.08] dark:border-white/[0.08] text-center space-y-3.5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto opacity-70">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {searchQuery
                  ? t("knowledge.empty_search", { keyword: searchQuery })
                  : t("knowledge.empty")}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="apple-pill-btn px-4 py-1.5 text-xs bg-[#0066cc] text-white active:scale-95 cursor-pointer shadow-xs"
                >
                  {t("knowledge.clear_search")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

