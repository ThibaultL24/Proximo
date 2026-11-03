import type { Article } from "../../types";
import "../../pages/admin/admin-gazette-studio.css";

export type Template = "portrait" | "pratique" | "reportage" | "couverture" | "agenda" | "photo";
export type PageDraft = {
  id: number;
  articleId: number | null;
  template: Template;
  rubric: string;
  note: string;
  article_snapshot?: {
    id: number; title: string; excerpt?: string | null;
    body?: string | null; cover_blob_id?: number | null; cover_image_url?: string | null;
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

function paragraphsOf(text: string): string[] {
  return text.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

function balanceColumns(parts: string[]): [string[], string[]] {
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
  draft, page, article, extraImage, headerLogo, footerLogo, qrImage,
}: {
  draft: EditionDraft;
  page: PageDraft;
  article: Article | undefined;
  extraImage?: string;
  headerLogo?: string;
  footerLogo?: string;
  qrImage?: string;
}) {
  const [left, right] = balanceColumns(paragraphsOf(article?.body || ""));
  const cover = article?.cover_image_url;
  const headline = article?.title || "Choisissez un article pour composer cette page";
  const isPractical = page.template === "pratique";
  const isPhoto = page.template === "photo";
  const isCover = page.template === "couverture";
  const isStory = page.template === "reportage";
  return (
    <article className={"gazette-proof-page gazette-layout-" + page.template}>
      <header className="gazette-reference-header">
        <div className="gazette-reference-brand" aria-label="Signature du partenaire">
          {headerLogo ? <img className="gazette-header-logo" src={headerLogo} alt="Logo de l'annonceur" /> : <><span className="gazette-brand-symbol">⌂</span><span>Propriétés-<br />privées.com</span></>}
        </div>
        <div className="gazette-reference-masthead">
          <strong>La Gazette</strong>
          <span>{draft.subtitle}</span>
        </div>
        <p className="gazette-reference-promise">UNE ÉQUIPE DYNAMIQUE DE<br />CONSEILLERS IMMOBILIERS !</p>
      </header>
      <div className="gazette-reference-territory">{draft.territory}</div>
      <main className="gazette-reference-content">
        {page.template !== "photo" && (
          <div className="gazette-reference-heading">
            {!isPractical && <p className="gazette-reference-rubric">{page.rubric}</p>}
            <h2>{headline}</h2>
            {(isPractical || page.template === "agenda") && <p className="gazette-reference-deck">{page.rubric}</p>}
            {article?.excerpt && !isPractical && <p className="gazette-reference-intro">{article.excerpt}</p>}
          </div>
        )}
        {isPhoto ? (
          <div className="gazette-reference-photo-layout">
            {cover && <img src={cover} alt="" />}
            <h2>{headline}</h2>
            <p>{article?.excerpt}</p>
          </div>
        ) : (
          <>
            {(isCover || isStory) && cover && <img src={cover} className="gazette-wide-photo" alt="" />}
            <div className="gazette-reference-columns">
              <div className="gazette-reference-column">
                <Paragraphs parts={left} />
                {!isCover && !isStory && cover && <img className="gazette-inline-photo" src={cover} alt="" />}
              </div>
              <div className="gazette-reference-column">
                {extraImage && <img className="gazette-inline-photo gazette-column-top-photo" src={extraImage} alt="" />}
                <Paragraphs parts={right} />
                {isPractical && page.note && <aside className="gazette-practical-note"><strong>BON À SAVOIR :</strong><p>{page.note.replace(/^BON À SAVOIR\s*:\s*/i, "")}</p></aside>}
              </div>
            </div>
            {isPractical && qrImage && <div className="gazette-reference-qr-promo"><span>Un projet dans votre entourage ? Découvrez notre réseau local.</span><img src={qrImage} alt="QR code fourni par la rédaction" /></div>}
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
          <div className="gazette-reference-ad-brand">{footerLogo ? <img src={footerLogo} alt="Logo de l'annonceur" /> : <>Propriétés<br /><strong>Privées</strong></>}</div>
        </div>
        <p>Édition {draft.edition.toLowerCase()} - {draft.issue.toLowerCase()}</p>
      </footer>
    </article>
  );
}

