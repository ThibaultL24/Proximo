import type { Article } from "../../types";
import "../../pages/admin/admin-gazette-studio.css";

export type Template = "portrait" | "pratique" | "reportage" | "couverture" | "agenda" | "photo";

export type PageDraft = {
  id: number;
  articleId: number | null;
  template: Template;
  rubric: string;
  note: string;
  leftHeading?: string;
  rightHeading?: string;
  imageCaption?: string;
  columnBreakAt?: number | null;
  article_snapshot?: {
    id: number;
    title: string;
    excerpt?: string | null;
    body?: string | null;
    cover_blob_id?: number | null;
    cover_image_url?: string | null;
  };
};

export type EditionDraft = {
  issue: string;
  edition: string;
  subtitle: string;
  territory: string;
  banner: string;
  contact: string;
  legal: string;
  pages: PageDraft[];
};

export function gazetteParagraphs(body: string): string[] {
  return body.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

export function splitGazetteColumns(parts: string[], manualCut?: number | null): [string[], string[]] {
  if (parts.length < 2) return [parts, []];
  if (manualCut != null && Number.isInteger(manualCut)) {
    const cut = Math.max(1, Math.min(parts.length - 1, manualCut));
    return [parts.slice(0, cut), parts.slice(cut)];
  }
  const total = parts.reduce((length, part) => length + part.length, 0);
  let current = 0;
  let cut = 0;
  while (cut < parts.length - 1 && current < total / 2) {
    current += parts[cut].length;
    cut += 1;
  }
  return [parts.slice(0, cut), parts.slice(cut)];
}

function Paragraphs({ parts }: { parts: string[] }) {
  return <>{parts.map((part, index) => {
    const heading = part.startsWith("## ") || (part.length < 85 && part.endsWith(":"));
    return heading
      ? <h3 className="gazette-article-subheading" key={index}>{part.replace(/^## /, "")}</h3>
      : <p className="gazette-article-paragraph" key={index}>{part.replace(/^#\s*/, "")}</p>;
  })}</>;
}

export function GazetteSheet({
  draft, page, article, extraImage, headerLogo, footerLogo, qrImage, spotlightLogo, promoImage,
}: {
  draft: EditionDraft;
  page: PageDraft;
  article: Article | undefined;
  extraImage?: string;
  headerLogo?: string;
  footerLogo?: string;
  qrImage?: string;
  spotlightLogo?: string;
  promoImage?: string;
}) {
  const [left, right] = splitGazetteColumns(
    gazetteParagraphs(article?.body || ""), page.columnBreakAt,
  );
  const cover = article?.cover_image_url;
  const headline = article?.title || "Choisissez un article pour composer cette page";
  const isPortrait = page.template === "portrait";
  const isPractical = page.template === "pratique";
  const isPhoto = page.template === "photo";
  const isCover = page.template === "couverture";
  const isStory = page.template === "reportage";

  return (
    <article className={"gazette-proof-page gazette-layout-" + page.template}>
      <header className="gazette-reference-header">
        <div className="gazette-reference-brand" aria-label="Signature du partenaire">
          {headerLogo
            ? <img className="gazette-header-logo" src={headerLogo} alt="Logo de l'annonceur" />
            : <div className="gazette-brand-fallback"><span className="gazette-brand-symbol">⌂</span><span>Propriétés-<br />privées.com</span></div>}
        </div>
        <div className="gazette-reference-masthead">
          <strong>La Gazette</strong>
          <span>{draft.subtitle}</span>
        </div>
        <p className="gazette-reference-promise">UNE ÉQUIPE DYNAMIQUE DE<br />CONSEILLERS IMMOBILIERS !</p>
      </header>

      <div className="gazette-reference-territory">{draft.territory}</div>

      <main className="gazette-reference-content">
        {isPortrait ? (
          <div className="gazette-portrait-grid">
            <div className="gazette-portrait-column">
              <div className="gazette-portrait-heading">
                <p className="gazette-reference-rubric">{page.rubric || "L'histoire des"}</p>
                <h2>{headline}</h2>
                {article?.excerpt && <p className="gazette-reference-intro">{article.excerpt}</p>}
              </div>
              <div className="gazette-portrait-intro">
                {spotlightLogo && <img className="gazette-spotlight-logo" src={spotlightLogo} alt="Logo du commerce présenté" />}
                <Paragraphs parts={left.slice(0, 1)} />
              </div>
              {page.leftHeading && <h3 className="gazette-article-subheading">{page.leftHeading}</h3>}
              <Paragraphs parts={left.slice(1)} />
              {extraImage && <img className="gazette-portrait-bottom-image" src={extraImage} alt="" />}
            </div>
            <div className="gazette-portrait-column gazette-portrait-right">
              {cover && <img className="gazette-portrait-hero" src={cover} alt="" />}
              {page.rightHeading && <h3 className="gazette-article-subheading gazette-portrait-caption">{page.rightHeading}</h3>}
              {page.imageCaption && <p className="gazette-image-caption">{page.imageCaption}</p>}
              <Paragraphs parts={right} />
            </div>
          </div>
        ) : isPractical ? (
          <>
            <div className="gazette-practical-heading">
              <h2>{headline}</h2>
              <p>{page.rubric}</p>
            </div>
            <div className="gazette-practical-columns">
              <div className="gazette-reference-column">
                <Paragraphs parts={left.slice(0, 1)} />
                {cover && <img className="gazette-practical-photo" src={cover} alt="" />}
                {page.leftHeading && <h3 className="gazette-article-subheading">{page.leftHeading}</h3>}
                <Paragraphs parts={left.slice(1)} />
              </div>
              <div className="gazette-reference-column">
                {page.rightHeading && <h3 className="gazette-article-subheading">{page.rightHeading}</h3>}
                <Paragraphs parts={right} />
              </div>
            </div>
            <div className="gazette-practical-bottom">
              <div className="gazette-practical-promo">
                {promoImage
                  ? <img src={promoImage} alt="Encart publicitaire de la Gazette" />
                  : <div className="gazette-practical-promo-fallback">
                      <strong>Un projet dans votre entourage ?</strong>
                      <span>Découvrez nos partenaires locaux</span>
                      {qrImage && <img src={qrImage} alt="QR code fourni par la rédaction" />}
                    </div>}
              </div>
              <aside className="gazette-practical-note">
                <strong>BON À SAVOIR :</strong>
                <p>{page.note.replace(/^BON À SAVOIR\s*:\s*/i, "")}</p>
              </aside>
            </div>
          </>
        ) : isPhoto ? (
          <div className="gazette-reference-photo-layout">
            {cover && <img src={cover} alt="" />}
            <h2>{headline}</h2>
            <p>{article?.excerpt}</p>
          </div>
        ) : (
          <>
            <div className="gazette-reference-heading">
              <p className="gazette-reference-rubric">{page.rubric}</p>
              <h2>{headline}</h2>
              {article?.excerpt && <p className="gazette-reference-intro">{article.excerpt}</p>}
            </div>
            {(isCover || isStory) && cover && <img src={cover} className="gazette-wide-photo" alt="" />}
            <div className="gazette-reference-columns">
              <div className="gazette-reference-column">
                {page.leftHeading && <h3 className="gazette-article-subheading">{page.leftHeading}</h3>}
                <Paragraphs parts={left} />
                {cover && !isCover && !isStory && <img className="gazette-inline-photo" src={cover} alt="" />}
              </div>
              <div className="gazette-reference-column">
                {page.rightHeading && <h3 className="gazette-article-subheading">{page.rightHeading}</h3>}
                {extraImage && <img className="gazette-inline-photo gazette-column-top-photo" src={extraImage} alt="" />}
                <Paragraphs parts={right} />
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="gazette-reference-footer">
        <div className="gazette-reference-ad">
          <div className="gazette-reference-contacts">
            <strong>{draft.banner}</strong>
            <span>{draft.contact}</span>
            <small>{draft.legal}</small>
            <small>NE PAS JETER SUR LA VOIE PUBLIQUE.</small>
          </div>
          <div className="gazette-reference-ad-brand">
            {footerLogo ? <img src={footerLogo} alt="Logo de l'annonceur" /> : <>Propriétés<br /><strong>Privées</strong></>}
          </div>
        </div>
        <p>Édition {draft.edition.toLowerCase()} - {draft.issue.toLowerCase()}</p>
      </footer>
    </article>
  );
}
