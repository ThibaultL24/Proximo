import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Article } from "../types";
import {
  GazetteSheet,
  type PageDraft,
  type EditionDraft,
} from "../components/gazette/gazette-sheet";

type Media = {
  extraImage?: string;
  qrImage?: string;
  spotlightLogo?: string;
  promoImage?: string;
  headerLogo?: string;
  footerLogo?: string;
};

function wordBreaks(body: string): number[] {
  const breaks = new Set<number>([body.length]);
  for (const match of body.matchAll(/\s+/g)) {
    if (match.index !== undefined) breaks.add(match.index + match[0].length);
  }
  return [...breaks].filter((n) => n > 0).sort((a, b) => a - b);
}

/** Paginates at word boundaries after measuring the real print DOM.
 *  Existing paragraphs are not rewritten; snapshots continue to reference
 *  the source article with persisted start/end offsets.
 */
export async function paginateGazetteArticle(
  draft: EditionDraft,
  sourcePage: PageDraft,
  article: Article,
  media: Media,
): Promise<PageDraft[]> {
  if (!article.body?.trim()) throw Error("Cet article ne contient aucun texte.");
  if (sourcePage.continuation) throw Error("Choisissez la première page de l'article.");
  if (!sourcePage.articleId) throw Error("Associez un article à cette page avant de paginer.");

  const body = article.body;
  const breaks = wordBreaks(body);
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText = [
    "position:fixed", "left:-20000px", "top:0", "visibility:hidden",
    "pointer-events:none", "width:210mm", "z-index:-100",
  ].join(";");

  document.body.appendChild(holder);
  const root = createRoot(holder);

  const fits = (page: PageDraft, hideMedia: boolean): boolean => {
    const printedArticle: Article = hideMedia
      ? { ...article, cover_image_url: undefined, excerpt: undefined }
      : article;

    flushSync(() => {
      root.render(createElement(GazetteSheet, {
        draft, page, article: printedArticle,
        headerLogo: media.headerLogo,
        footerLogo: media.footerLogo,
        extraImage: hideMedia ? undefined : media.extraImage,
        qrImage: hideMedia ? undefined : media.qrImage,
        spotlightLogo: hideMedia ? undefined : media.spotlightLogo,
        promoImage: hideMedia ? undefined : media.promoImage,
      }));
    });

    const content = holder.querySelector<HTMLElement>(".gazette-reference-content");
    const footer = holder.querySelector<HTMLElement>(".gazette-reference-footer");
    if (!content || !footer) return false;
    if (content.scrollHeight > content.clientHeight + 2) return false;

    const bottom = footer.getBoundingClientRect().top - 2;
    return [...content.querySelectorAll<HTMLElement>(
      ".gazette-article-paragraph, .gazette-article-subheading, img, .gazette-practical-note",
    )].every((element) => element.getBoundingClientRect().bottom <= bottom);
  };

  const nextPages: PageDraft[] = [];
  let offset = 0;
  let nextId = Math.max(...draft.pages.map((page) => page.id), 0) + 1;

  try {
    // Mount once to discover the fonts required by the actual gabarit.
    fits({ ...sourcePage, contentStart: 0, contentEnd: breaks[0] }, false);
    if (document.fonts) await document.fonts.ready;

    while (offset < body.length) {
      if (nextPages.length >= 40) {
        throw Error("Le texte nécessite plus de 40 pages. Divisez l'article en plusieurs articles.");
      }
      const isContinuation = nextPages.length > 0;
      const templatePage: PageDraft = isContinuation
        ? {
            id: nextId++, articleId: sourcePage.articleId, template: "reportage",
            rubric: "SUITE DE L'ARTICLE", note: "", continuation: true,
          }
        : { ...sourcePage, continuation: false };

      const startAt = breaks.findIndex((n) => n > offset);
      if (startAt < 0) throw Error("Impossible de découper le texte.");

      let low = startAt;
      let high = breaks.length - 1;
      let best = -1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const test = { ...templatePage, contentStart: offset, contentEnd: breaks[mid] };
        if (fits(test, isContinuation)) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (best < 0) {
        throw Error(
          "La page est trop chargée pour contenir la suite du texte. " +
          "Réduisez la taille de l'illustration ou retirez un encart."
        );
      }

      const end = breaks[best];
      nextPages.push({ ...templatePage, contentStart: offset, contentEnd: end });
      offset = end;
    }
    return nextPages;
  } finally {
    flushSync(() => root.unmount());
    holder.remove();
  }
}
