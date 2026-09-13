"use client";

import * as React from "react";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";

export interface ParsedBlock {
  type: "h1" | "h2" | "h3" | "paragraph" | "ordered_list" | "unordered_list" | "code" | "callout";
  text?: string;
  items?: string[];
  lang?: string;
  code?: string;
}

const parsedMarkdownCache = new Map<string, ParsedBlock[]>();

/**
 * Line-by-line Markdown Parser ensuring headings and lists without empty lines are properly parsed
 */
export function parseMarkdown(content: string): ParsedBlock[] {
  if (!content) return [];
  if (parsedMarkdownCache.has(content)) {
    return parsedMarkdownCache.get(content)!;
  }

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
  parsedMarkdownCache.set(content, blocks);
  return blocks;
}

/**
 * Render inline markdown tokens: **bold**, `code`, [link](url)
 */
export function renderInline(text: string): React.ReactNode {
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
 * Premium Apple HIG Article / Markdown Renderer with proper typography, step badges & code copy
 */
export const ArticleRenderer = React.memo(function ArticleRenderer({ content, className }: { content: string; className?: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={className || "space-y-4 leading-relaxed prose prose-neutral dark:prose-invert max-w-none"}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const blocks = parseMarkdown(content);

  return (
    <div className={className || "space-y-6 leading-relaxed"}>
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
});
