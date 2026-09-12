"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { formatDate } from "@/lib/format";
import type { XboardKnowledge } from "@/types/xboard";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
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
          {/* Subtle Ambient Apple Blue Glow Gradient at top of Reader */}
          <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#0066cc]/[0.06] dark:from-[#2997ff]/[0.08] via-[#0066cc]/[0.01] to-transparent pointer-events-none rounded-t-[24px]" />

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

interface ParsedBlock {
  type: "h1" | "h2" | "h3" | "paragraph" | "ordered_list" | "unordered_list" | "code" | "callout";
  text?: string;
  items?: string[];
  lang?: string;
  code?: string;
}

/**
 * Line-by-line Markdown Parser ensuring headings and lists without empty lines are properly parsed
 */
function parseMarkdown(content: string): ParsedBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: ParsedBlock[] = [];

  let inCode = false;
  let codeLang = "";
  let codeLines: string[] = [];

  let currentList: { type: "ordered_list" | "unordered_list"; items: string[] } | null = null;
  let currentCallout: string[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: "paragraph",
        text: currentParagraph.join(" ").trim(),
      });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push({
        type: currentList.type,
        items: currentList.items,
      });
      currentList = null;
    }
  };

  const flushCallout = () => {
    if (currentCallout.length > 0) {
      blocks.push({
        type: "callout",
        text: currentCallout.join(" ").trim(),
      });
      currentCallout = [];
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushCallout();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Code Block Fence
    if (trimmed.startsWith("```")) {
      if (inCode) {
        blocks.push({
          type: "code",
          lang: codeLang,
          code: codeLines.join("\n"),
        });
        inCode = false;
        codeLang = "";
        codeLines = [];
      } else {
        flushAll();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }

    // 2. Empty line
    if (!trimmed) {
      flushAll();
      continue;
    }

    // 3. Headings: #, ##, ###
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      flushAll();

      if (trimmed.startsWith("### ")) {
        blocks.push({
          type: "h3",
          text: trimmed.slice(4).trim(),
        });
      } else if (trimmed.startsWith("## ")) {
        const text = trimmed.slice(3).trim();
        // Clean out redundant "步骤一：" / "Step 1:" / "问题一：" prefix if present
        const cleanTitle = text.replace(
          /^(步骤[一二三四五六七八九十0-9]+|Step\s*[0-9]+|问题[一二三四五六七八九十0-9]+)[：:.\s]*/i,
          ""
        );
        blocks.push({
          type: "h2",
          text: cleanTitle || text,
        });
      } else {
        blocks.push({
          type: "h1",
          text: trimmed.slice(2).trim(),
        });
      }
      continue;
    }

    // 4. Blockquote / Callout (> ...)
    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      currentCallout.push(trimmed.replace(/^>\s*/, ""));
      continue;
    } else if (currentCallout.length > 0) {
      flushCallout();
    }

    // 5. Ordered list item (e.g. "1. ", "2. ")
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      flushParagraph();
      if (currentList && currentList.type !== "ordered_list") {
        flushList();
      }
      if (!currentList) {
        currentList = { type: "ordered_list", items: [] };
      }
      currentList.items.push(orderedMatch[2].trim());
      continue;
    }

    // 6. Unordered list item (e.g. "- ", "* ")
    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)/);
    if (unorderedMatch) {
      flushParagraph();
      if (currentList && currentList.type !== "unordered_list") {
        flushList();
      }
      if (!currentList) {
        currentList = { type: "unordered_list", items: [] };
      }
      currentList.items.push(unorderedMatch[1].trim());
      continue;
    }

    // 7. Indented list continuation
    if (currentList && (rawLine.startsWith("   ") || rawLine.startsWith("\t"))) {
      const lastIndex = currentList.items.length - 1;
      if (lastIndex >= 0) {
        currentList.items[lastIndex] += " " + trimmed;
        continue;
      }
    }

    // 8. Regular text paragraph
    flushList();
    currentParagraph.push(trimmed);
  }

  flushAll();
  return blocks;
}

/**
 * Render inline markdown tokens: **bold**, `code`, [link](url)
 */
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **...**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline Code: `...`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded-[6px] bg-secondary text-[#0066cc] dark:text-[#2997ff] font-mono text-[12px] sm:text-[13px] border border-border/70 select-text"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Markdown link: [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-[#0066cc] dark:text-[#2997ff] underline underline-offset-4 hover:opacity-80 transition-opacity font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/**
 * Premium Apple HIG Article Renderer with proper typography, step badges & code copy
 */
function ArticleRenderer({ content }: { content: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className="space-y-4 leading-relaxed prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const blocks = parseMarkdown(content);

  return (
    <div className="space-y-6 leading-relaxed">
      {blocks.map((block, idx) => {
        // H1 (Intro Headline)
        if (block.type === "h1") {
          return (
            <h3
              key={idx}
              className="text-lg sm:text-xl font-semibold apple-headline tracking-tight text-foreground pb-1"
            >
              {renderInline(block.text || "")}
            </h3>
          );
        }

        // H2 (Section Header)
        if (block.type === "h2") {
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg font-semibold apple-headline tracking-tight text-foreground pt-6 pb-2.5 border-b border-border/60"
            >
              {renderInline(block.text || "")}
            </h3>
          );
        }

        // H3 (Subheading)
        if (block.type === "h3") {
          return (
            <h4
              key={idx}
              className="text-[15px] font-semibold tracking-tight text-foreground pt-3"
            >
              {renderInline(block.text || "")}
            </h4>
          );
        }

        // Ordered List (Numbered Steps)
        if (block.type === "ordered_list") {
          return (
            <ol key={idx} className="space-y-3 pl-0.5 py-1">
              {block.items?.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-foreground/90 text-[14px] sm:text-[15px] leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-secondary border border-border/80 text-muted-foreground text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none font-mono">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {renderInline(item)}
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        // Unordered List (Bullet Points)
        if (block.type === "unordered_list") {
          return (
            <ul key={idx} className="space-y-2.5 pl-0.5 py-1">
              {block.items?.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-foreground/90 text-[14px] sm:text-[15px] leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066cc] dark:bg-[#2997ff] shrink-0 mt-2.5 select-none" />
                  <div className="flex-1 min-w-0">
                    {renderInline(item)}
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        // Code Block
        if (block.type === "code") {
          return (
            <div
              key={idx}
              className="relative my-4 rounded-[16px] bg-[#1c1c1e] text-white p-4 sm:p-5 font-mono text-xs overflow-x-auto border border-white/10 group shadow-sm select-none"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 select-none">
                <div className="flex items-center gap-1.5 select-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  {block.lang && (
                    <span className="text-[11px] text-white/50 font-mono ml-2 uppercase select-none">
                      {block.lang}
                    </span>
                  )}
                </div>
                <AppleCopyButton
                  textToCopy={block.code || ""}
                  defaultText="复制命令"
                  copiedText="已复制"
                  size="sm"
                  variant="primary"
                  className="w-24 h-7 shrink-0 text-xs"
                />
              </div>
              <pre className="whitespace-pre-wrap select-all text-neutral-200 font-mono leading-relaxed select-text">
                {block.code}
              </pre>
            </div>
          );
        }

        // Callout Block
        if (block.type === "callout") {
          return (
            <div
              key={idx}
              className="p-4 rounded-[16px] bg-[#0066cc]/5 dark:bg-[#2997ff]/10 border-l-3 border-[#0066cc] dark:border-[#2997ff] text-[14px] text-foreground/85 my-3 flex items-start gap-2.5 leading-relaxed"
            >
              <div className="flex-1">
                {renderInline(block.text || "")}
              </div>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-foreground/85 leading-relaxed text-[14px] sm:text-[15px]">
            {renderInline(block.text || "")}
          </p>
        );
      })}
    </div>
  );
}
