import { useEffect, useMemo, useState } from "react";
import { fetchAdminArticles } from "../../api/admin-articles";
import type { Article } from "../../types";
import "./admin-gazette-studio.css";

type Template = "portrait" | "pratique" | "reportage" | "couverture" | "agenda" | "photo";
type PageDraft = {
  id: number;
  articleId: number | null;
  template: Template;
  rubric: string;
  note: string;
};
type EditionDraft = {
  issue: string;
  edition: string;
  subtitle: string;
  territory: string;
  banner: string;
  contact: string;
  legal: string;
  pages: PageDraft[];
};
const STORAGE_KEY = "fenetre-ouverte-gazette-reference-v1";
const TEMPLATES: Record<Template, string> = {
  portrait: "Portrait local (page 1 du modèle)",
  pratique: "Article pratique (page 2 du modèle)",
  reportage: "Reportage",
  couverture: "Couverture",
  agenda: "Agenda",
  photo: "Pleine page photo",
};
const INITIAL: EditionDraft = {
  issue: "N° 7",
  edition: "Octobre 2026",
  subtitle: "de Martine et Jean-Michel",
  territory: "SECTEUR DRÔME - ARDÈCHE, VAUCLUSE ET SES ENVIRONS",
  banner: "MARTINE BRANGER - PROPRIÉTÉS PRIVÉES",
  contact: "06 15 92 27 87 - 06 42 40 19 27",
  legal: "ENREGISTRÉ AU TRIBUNAL DE PRIVAS - RSAC518821392",
  pages: [
    { id: 1, articleId: null, template: "portrait", rubric: "L'histoire des", note: "" },
    { id: 2, articleId: null, template: "pratique", rubric: "COMPRENDRE LES ENJEUX ET LES SOLUTIONS", note: "BON À SAVOIR : Avant d'engager des travaux, renseignez-vous auprès d'un organisme public ou d'un conseiller compétent." },
  ],
};

function loadDraft(): EditionDraft {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") as Partial<EditionDraft> | null;
    if (saved && Array.isArray(saved.pages) && saved.pages.length > 0) {
      return { ...INITIAL, ...saved, pages: saved.pages };
    }
  } catch {
    // Le studio reste utilisable si le navigateur bloque le stockage local.
  }
  return INITIAL;
}

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

function GazetteSheet({
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

export function AdminGazetteStudioPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState<EditionDraft>(loadDraft);
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [extraImages, setExtraImages] = useState<Record<number, string>>({});
  const [qrImages, setQrImages] = useState<Record<number, string>>({});
  const [headerLogo, setHeaderLogo] = useState<string>();
  const [footerLogo, setFooterLogo] = useState<string>();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAdminArticles({ scope: "gazette" }).then((data) => {
      setArticles(data);
      setDraft((current) => current.pages.every((page) => page.articleId === null) && data.length > 0
        ? { ...current, pages: current.pages.map((page, index) => ({ ...page, articleId: data[index % data.length].id })) }
        : current);
    }).catch(() => setError("Impossible de charger les articles de la Gazette."));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      // Brouillon uniquement enregistré sur ce navigateur, pas en base.
    } catch {
      // L'impression et l'aperçu restent disponibles.
    }
  }, [draft]);

  const selectedPage = draft.pages.find((page) => page.id === selectedPageId) || draft.pages[0];
  const currentArticle = useMemo(
    () => articles.find((article) => article.id === selectedPage?.articleId),
    [articles, selectedPage?.articleId]
  );
  const updateEdition = (field: keyof Omit<EditionDraft, "pages">, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };
  const updatePage = (field: keyof Omit<PageDraft, "id">, value: PageDraft[typeof field]) => {
    setDraft((current) => ({
      ...current,
      pages: current.pages.map((page) => page.id === selectedPage.id ? { ...page, [field]: value } : page),
    }));
  };
  const addPage = () => {
    const id = Math.max(0, ...draft.pages.map((page) => page.id)) + 1;
    setDraft((current) => ({
      ...current,
      pages: [...current.pages, { id, template: "portrait", articleId: null, rubric: "À découvrir", note: "" }],
    }));
    setSelectedPageId(id);
  };
  const removePage = () => {
    if (draft.pages.length < 2) return;
    const remaining = draft.pages.filter((page) => page.id !== selectedPage.id);
    setDraft((current) => ({ ...current, pages: remaining }));
    setSelectedPageId(remaining[0].id);
  };
  const readImage = (file: File | undefined, onReady: (data: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5_000_000) {
      setError("Choisissez une image de moins de 5 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") onReady(reader.result); };
    reader.readAsDataURL(file);
  };
  const loadImage = (file?: File) => readImage(file, (value) => setExtraImages((images) => ({ ...images, [selectedPage.id]: value })));

  return <section className="gazette-studio space-y-6">
    <header className="gazette-studio-heading">
      <p>FENÊTRE OUVERTE · ATELIER D'ÉDITION</p>
      <h1>Studio Gazette</h1>
      <span>Composition A4 fidèle à la Gazette d'octobre 2026 : bandeaux roses, deux colonnes, photographies et publicité en pied.</span>
    </header>
    <div className="gazette-studio-controls">
      <div className="gazette-studio-settings">
        <h2>Identité de l'édition</h2>
        <div className="gazette-control-grid">
          {([
            ["edition", "Mois / année"],
            ["issue", "Numéro"],
            ["subtitle", "Signature de la Gazette"],
            ["territory", "Territoire"],
            ["banner", "Annonceur / bandeau"],
            ["contact", "Coordonnées"],
            ["legal", "Mentions légales"],
          ] as const).map(([field, label]) => (
            <label key={field}>{label}<input value={draft[field]} onChange={(event) => updateEdition(field, event.target.value)} /></label>
          ))}
        </div>
      </div>
          <div className="gazette-control-grid gazette-logo-controls">
            <label>Logo d'en-tête (optionnel)<input type="file" accept="image/*" onChange={(event) => readImage(event.target.files?.[0], setHeaderLogo)} /></label>
            <label>Logo du pied publicitaire (optionnel)<input type="file" accept="image/*" onChange={(event) => readImage(event.target.files?.[0], setFooterLogo)} /></label>
          </div>
      <div className="gazette-studio-settings">
        <h2>Composition des pages</h2>
        <div className="gazette-page-tabs">
          {draft.pages.map((page, index) => (
            <button key={page.id} type="button" className={page.id === selectedPage.id ? "active" : ""}
              onClick={() => setSelectedPageId(page.id)}>Page {index + 1}</button>
          ))}
          <button type="button" onClick={addPage}>+ Page</button>
        </div>
        <div className="gazette-control-grid">
          <label>Modèle
            <select value={selectedPage.template} onChange={(event) => updatePage("template", event.target.value as Template)}>
              {(Object.keys(TEMPLATES) as Template[]).map((key) => <option value={key} key={key}>{TEMPLATES[key]}</option>)}
            </select>
          </label>
          <label>Article importé
            <select value={selectedPage.articleId ?? ""} onChange={(event) => updatePage("articleId", event.target.value ? Number(event.target.value) : null)}>
              <option value="">Sélectionner un article</option>
              {articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
            </select>
          </label>
          <label>Rubrique ou sous-titre<input value={selectedPage.rubric} onChange={(event) => updatePage("rubric", event.target.value)} /></label>
          <label>Seconde photographie (facultative)<input type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} /></label>
          <label>QR code existant (image facultative)<input type="file" accept="image/*" onChange={(event) => readImage(event.target.files?.[0], (value) => setQrImages((images) => ({ ...images, [selectedPage.id]: value })))} /></label>
        </div>
        {selectedPage.template === "pratique" && <label className="gazette-note-label">Encadré « Bon à savoir »
          <textarea rows={3} value={selectedPage.note} onChange={(event) => updatePage("note", event.target.value)} />
        </label>}
        <div className="gazette-studio-actions">
          <button type="button" onClick={() => window.print()}>Imprimer / Exporter en PDF A4</button>
          <button type="button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2500); }}>Confirmer le brouillon local</button>
          {draft.pages.length > 1 && <button type="button" className="gazette-remove-page" onClick={removePage}>Supprimer cette page</button>}
        </div>
        {saved && <p role="status" className="gazette-studio-notice">Brouillon enregistré dans ce navigateur uniquement.</p>}
        {error && <p role="alert" className="gazette-studio-error">{error}</p>}
        {currentArticle && currentArticle.body.length > 3800 && <p className="gazette-studio-warning">Article long : vérifiez visuellement le débordement dans l'aperçu d'impression. La pagination automatique et l'archivage serveur restent à consolider.</p>}
        <p className="gazette-studio-help">Les textes viennent de l'éditeur d'articles. Les logos, photos et QR importés ici sont temporaires ; ils ne survivent pas à un rechargement. Vérifiez qu'un QR téléchargé est scannable avant impression. Aucune édition n'est encore publiée depuis ce studio.</p>
      </div>
    </div>
    <div className="gazette-proof-scroller">
      {draft.pages.map((page) => (
        <GazetteSheet key={page.id} draft={draft} page={page}
          article={articles.find((article) => article.id === page.articleId)}
          extraImage={extraImages[page.id]} qrImage={qrImages[page.id]}
          headerLogo={headerLogo} footerLogo={footerLogo} />
      ))}
    </div>
  </section>;
}
