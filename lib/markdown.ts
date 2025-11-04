// lib/markdown.ts
import { marked } from "marked";

/**
 * Converts our MDX-lite to plain HTML:
 * <Intro>...</Intro>      -> <div class="intro">...</div>
 * <QuestLink href="...">  -> <a class="quest-link" href="...">...</a>
 */
export function mdxLiteToHtml(mdxSource: string): string {
  let src = mdxSource;

  // Replace <Intro>...</Intro>
  src = src.replace(
    /<Intro>\s*([\s\S]*?)\s*<\/Intro>/g,
    (_m, inner) => `\n<div class="intro">\n${inner}\n</div>\n`
  );

  // Replace <QuestLink href="...">...</QuestLink>
  src = src.replace(
    /<QuestLink\s+href="([^"]+)"\s*>\s*([\s\S]*?)\s*<\/QuestLink>/g,
    (_m, href, inner) => `<a class="quest-link underline" href="${href}">${inner}</a>`
  );

  // Now parse markdown to HTML (allow inline HTML)
  const html = marked.parse(src, { gfm: true }) as string;
  return html;
}
