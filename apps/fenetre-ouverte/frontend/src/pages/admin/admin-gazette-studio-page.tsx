import { useEffect, useMemo, useState } from "react";
import { fetchAdminArticles } from "../../api/admin-articles";
import { API_ROOT } from "../../api/client";
import { checkGazettePrint } from "../../lib/gazette-print-check";
import type { Article } from "../../types";
import {
  GazetteSheet, type Template, type PageDraft, type EditionDraft,
} from "../../components/gazette/gazette-sheet";
import {
  listGazetteEditions, getGazetteEdition, createGazetteEdition, updateGazetteEdition,
  publishGazetteEdition, archiveGazetteEdition, uploadGazetteEditionAsset,
  type GazetteEditionRecord, type GazetteEditionInput,
} from "../../api/gazette-editions";
import "./admin-gazette-studio.css";

const STORAGE_KEY = "fenetre-ouverte-gazette-reference-v1";
function mediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("/") ? API_ROOT + url : url;
}
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
    { id: 1, articleId: null, template: "portrait", rubric: "L'histoire des", note: "", leftHeading: "Du côté de Cédric, les arbres d'Aizac", rightHeading: "Du côté de Dorine, la terre de mon papa" },
    { id: 2, articleId: null, template: "pratique", rubric: "COMPRENDRE LES ENJEUX ET LES SOLUTIONS", leftHeading: "Pourquoi un logement devient-il énergivore ?", rightHeading: "Un enjeu pour les propriétaires", note: "BON À SAVOIR : Avant d'engager des travaux, renseignez-vous auprès d'un organisme public ou d'un conseiller compétent." },
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

export function AdminGazetteStudioPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState<EditionDraft>(loadDraft);
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [extraImages, setExtraImages] = useState<Record<number, string>>({});
  const [qrImages, setQrImages] = useState<Record<number, string>>({});
  const [spotlightLogos, setSpotlightLogos] = useState<Record<number, string>>({});
  const [promoImages, setPromoImages] = useState<Record<number, string>>({});
  const [headerLogo, setHeaderLogo] = useState<string>();
  const [footerLogo, setFooterLogo] = useState<string>();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [serverEditions, setServerEditions] = useState<GazetteEditionRecord[]>([]);
  const [serverEdition, setServerEdition] = useState<GazetteEditionRecord | null>(null);
  const [serverBusy, setServerBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pendingAssets, setPendingAssets] = useState<Record<string, File>>({});
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    fetchAdminArticles({ scope: "gazette" }).then((data) => {
      setArticles(data);
      setDraft((current) => current.pages.every((page) => page.articleId === null) && data.length > 0
        ? { ...current, pages: current.pages.map((page, index) => ({ ...page, articleId: data[index % data.length].id })) }
        : current);
    }).catch(() => setError("Impossible de charger les articles de la Gazette."));
  }, []);

  useEffect(() => {
    listGazetteEditions().then(setServerEditions)
      .catch(() => setError("Impossible de consulter les éditions déjà sauvegardées."));
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
  const serverReadOnly = Boolean(serverEdition && serverEdition.status !== "draft");
  const buildPayload = (): GazetteEditionInput => ({
    issue_label: draft.issue,
    edition_label: draft.edition,
    settings: {
      subtitle: draft.subtitle, territory: draft.territory, banner: draft.banner,
      contact: draft.contact, legal: draft.legal,
    },
    pages: draft.pages.map(({ id, template, articleId, rubric, note, leftHeading, rightHeading, imageCaption, columnBreakAt }) =>
      ({ id, template, articleId, rubric, note, leftHeading, rightHeading, imageCaption, columnBreakAt })),
  });
  const applyEdition = (edition: GazetteEditionRecord) => {
    setDraft({
      issue: edition.issue_label, edition: edition.edition_label,
      subtitle: edition.settings.subtitle, territory: edition.settings.territory,
      banner: edition.settings.banner, contact: edition.settings.contact,
      legal: edition.settings.legal, pages: edition.pages,
    });
    setServerEdition(edition);
    setSelectedPageId(edition.pages[0]?.id ?? 1);
    setHeaderLogo(mediaUrl(edition.asset_urls?.headerLogo));
    setFooterLogo(mediaUrl(edition.asset_urls?.footerLogo));
    const extras: Record<number, string> = {};
    const qrs: Record<number, string> = {};
    const logos: Record<number, string> = {};
    const promos: Record<number, string> = {};
    Object.entries(edition.asset_urls || {}).forEach(([key, url]) => {
      const parts = key.split(":");
      if (parts.length === 2 && url && Number(parts[1]) > 0) {
        if (parts[0] === "extraImage") extras[Number(parts[1])] = mediaUrl(url) || "";
        if (parts[0] === "qrImage") qrs[Number(parts[1])] = mediaUrl(url) || "";
        if (parts[0] === "spotlightLogo") logos[Number(parts[1])] = mediaUrl(url) || "";
        if (parts[0] === "promoImage") promos[Number(parts[1])] = mediaUrl(url) || "";
      }
    });
    setExtraImages(extras); setQrImages(qrs);
    setSpotlightLogos(logos); setPromoImages(promos); setPendingAssets({}); setDirty(false);
    setServerMessage("Édition rechargée depuis le serveur.");
    setError("");
  };
  const refreshEditions = async () => {
    setServerEditions(await listGazetteEditions());
  };
  const loadEdition = async (id: number) => {
    setServerBusy(true);
    try { applyEdition(await getGazetteEdition(id)); }
    catch { setError("Impossible de charger cette édition."); }
    finally { setServerBusy(false); }
  };
  const saveOnServer = async () => {
    if (serverReadOnly) {
      setError("Ce numéro est figé. Choisissez « Nouveau numéro » pour créer une autre édition.");
      return;
    }
    setServerBusy(true); setError(""); setServerMessage("");
    try {
      const payload = buildPayload();
      const result = serverEdition
        ? await updateGazetteEdition(serverEdition, payload)
        : await createGazetteEdition(payload);
      setServerEdition(result);
      let saved = result;
      for (const [key, file] of Object.entries(pendingAssets)) {
        const [slot, pageId] = key.split(":");
        saved = await uploadGazetteEditionAsset(
          saved, slot as "headerLogo" | "footerLogo" | "extraImage" | "qrImage" | "spotlightLogo" | "promoImage",
          file, pageId ? Number(pageId) : undefined
        );
        setServerEdition(saved);
      }
      setPendingAssets({});
      setDirty(false);
      await refreshEditions();
      setServerMessage("Brouillon et médias enregistrés sur le serveur, version " + saved.lock_version + ".");
    } catch {
      setError("Enregistrement impossible (doublon, conflit de version ou erreur réseau). Rechargez l'édition avant de réessayer.");
    } finally { setServerBusy(false); }
  };
  const printProof = async () => {
    const reason = await checkGazettePrint();
    if (reason) { setError(reason); return; }
    setError("");
    window.print();
  };
  const publishOnServer = async () => {
    if (!serverEdition || serverEdition.status !== "draft") return;
    if (dirty || Object.keys(pendingAssets).length > 0) {
      setError("Enregistrez d'abord toutes les modifications et les images sur le serveur.");
      return;
    }
    if (draft.pages.some((page) => !page.articleId)) {
      setError("Associez un article à chaque page avant publication.");
      return;
    }
    const printError = await checkGazettePrint();
    if (printError) { setError(printError); return; }
    setServerBusy(true); setError(""); setServerMessage("");
    try {
      const result = await publishGazetteEdition(serverEdition);
      applyEdition(result);
      await refreshEditions();
      setServerMessage("Édition figée. Les textes des articles sont maintenant archivés en instantané.");
    } catch { setError("Publication refusée : vérifiez les articles et la dernière version du brouillon."); }
    finally { setServerBusy(false); }
  };
  const archiveOnServer = async () => {
    if (!serverEdition || serverEdition.status !== "published") return;
    setServerBusy(true); setError("");
    try {
      const result = await archiveGazetteEdition(serverEdition);
      applyEdition(result);
      await refreshEditions();
      setServerMessage("Édition archivée. Son contenu est conservé.");
    } catch { setError("Archivage impossible."); }
    finally { setServerBusy(false); }
  };
  const newEdition = () => {
    setServerEdition(null);
    setHeaderLogo(undefined); setFooterLogo(undefined);
    setExtraImages({}); setQrImages({}); setSpotlightLogos({}); setPromoImages({}); setPendingAssets({});
    setDirty(true);
    setDraft((current) => ({ ...current,
      issue: "", edition: "", pages: current.pages.map(({ article_snapshot: _snapshot, ...page }) => page),
    }));
    setServerMessage("Nouveau numéro : renseignez un numéro et un mois avant l'enregistrement.");
    setError("");
  };
  const currentArticle = useMemo(
    () => articles.find((article) => article.id === selectedPage?.articleId),
    [articles, selectedPage?.articleId]
  );
  const updateEdition = (field: keyof Omit<EditionDraft, "pages">, value: string) => {
    if (serverReadOnly) return;
    setDraft((current) => ({ ...current, [field]: value }));
    setDirty(true);
  };
  const updatePage = (field: keyof Omit<PageDraft, "id">, value: PageDraft[typeof field]) => {
    if (serverReadOnly) return;
    setDraft((current) => ({
      ...current,
      pages: current.pages.map((page) => page.id === selectedPage.id ? { ...page, [field]: value } : page),
    }));
    setDirty(true);
  };
  const addPage = () => {
    if (serverReadOnly) return;
    const id = Math.max(0, ...draft.pages.map((page) => page.id)) + 1;
    setDraft((current) => ({
      ...current,
      pages: [...current.pages, { id, template: "portrait", articleId: null, rubric: "À découvrir", note: "" }],
    }));
    setSelectedPageId(id);
    setDirty(true);
  };
  const movePage = (offset: -1 | 1) => {
    if (serverReadOnly) return;
    const index = draft.pages.findIndex((page) => page.id === selectedPage.id);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= draft.pages.length) return;
    setDraft((current) => {
      const pages = [...current.pages];
      [pages[index], pages[target]] = [pages[target], pages[index]];
      return { ...current, pages };
    });
    setDirty(true);
  };
  const removePage = () => {
    if (serverReadOnly || draft.pages.length < 2) return;
    const remaining = draft.pages.filter((page) => page.id !== selectedPage.id);
    setDraft((current) => ({ ...current, pages: remaining }));
    setSelectedPageId(remaining[0].id);
    setDirty(true);
  };
  const readImage = (file: File | undefined, onReady: (data: string) => void) => {
    if (serverReadOnly || !file) return;
    if (!file.type.startsWith("image/") || file.size > 5_000_000) {
      setError("Choisissez une image de moins de 5 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") onReady(reader.result); };
    reader.readAsDataURL(file);
  };
  const registerAsset = (key: string, file: File | undefined) => {
    if (serverReadOnly || !file) return;
    setPendingAssets((assets) => ({ ...assets, [key]: file }));
    setDirty(true);
  };
  const loadImage = (file?: File) => readImage(file, (value) => {
    setExtraImages((images) => ({ ...images, [selectedPage.id]: value }));
    if (file) registerAsset("extraImage:" + selectedPage.id, file);
  });
  const loadPageAsset = (slot: "spotlightLogo" | "promoImage", file?: File) => readImage(file, (value) => {
    const pageId = selectedPage.id;
    if (slot === "spotlightLogo") setSpotlightLogos((images) => ({ ...images, [pageId]: value }));
    else setPromoImages((images) => ({ ...images, [pageId]: value }));
    if (file) registerAsset(slot + ":" + pageId, file);
  });

  return <section className="gazette-studio space-y-6">
    <header className="gazette-studio-heading">
      <p>FENÊTRE OUVERTE · ATELIER D'ÉDITION</p>
      <h1>Studio Gazette</h1>
      <span>Composition A4 fidèle à la Gazette d'octobre 2026 : bandeaux roses, deux colonnes, photographies et publicité en pied.</span>
    </header>
    <div className="gazette-edition-toolbar">
      <label>Éditions sauvegardées
        <select value={serverEdition?.id ?? ""} disabled={serverBusy}
          onChange={(event) => { if (event.target.value) void loadEdition(Number(event.target.value)); }}>
          <option value="">Brouillon local / nouveau numéro</option>
          {serverEditions.map((edition) => (
            <option key={edition.id} value={edition.id}>
              {edition.issue_label} · {edition.edition_label} · {edition.status}
            </option>
          ))}
        </select>
      </label>
      <button type="button" disabled={serverBusy} onClick={newEdition}>Nouveau numéro</button>
      <button type="button" disabled={serverBusy || serverReadOnly || !draft.issue.trim() || !draft.edition.trim()}
        onClick={() => void saveOnServer()}>Enregistrer sur le serveur</button>
      <button type="button" disabled={serverBusy || !serverEdition || serverEdition.status !== "draft"}
        onClick={() => void publishOnServer()}>Figer / publier l'édition</button>
      <button type="button" disabled={serverBusy || serverEdition?.status !== "published"}
        onClick={() => void archiveOnServer()}>Archiver</button>
    </div>
    {serverEdition && <p className="gazette-edition-status">Numéro {serverEdition.issue_label} · {serverEdition.status} · version {serverEdition.lock_version}.
      {serverReadOnly ? " Textes figés : créer un nouveau numéro pour modifier." : dirty ? " Modifications non enregistrées." : " Brouillon synchronisé avec le serveur."}
    </p>}
    {serverMessage && <p role="status" className="gazette-studio-notice">{serverMessage}</p>}
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
            <label key={field}>{label}<input disabled={serverReadOnly} value={draft[field]} onChange={(event) => updateEdition(field, event.target.value)} /></label>
          ))}
        </div>
      </div>
          <div className="gazette-control-grid gazette-logo-controls">
            <label>Logo d'en-tête (optionnel)<input disabled={serverReadOnly} type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              readImage(file, (value) => { setHeaderLogo(value); registerAsset("headerLogo", file); });
            }} /></label>
            <label>Logo du pied publicitaire (optionnel)<input disabled={serverReadOnly} type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              readImage(file, (value) => { setFooterLogo(value); registerAsset("footerLogo", file); });
            }} /></label>
          </div>
      <div className="gazette-studio-settings">
        <h2>Composition des pages</h2>
        <div className="gazette-page-tabs">
          {draft.pages.map((page, index) => (
            <button key={page.id} type="button" className={page.id === selectedPage.id ? "active" : ""}
              onClick={() => setSelectedPageId(page.id)}>Page {index + 1}</button>
          ))}
          <button type="button" disabled={serverReadOnly} onClick={addPage}>+ Page</button>
          <button type="button" disabled={serverReadOnly || draft.pages[0]?.id === selectedPage.id} onClick={() => movePage(-1)}>↑ Monter</button>
          <button type="button" disabled={serverReadOnly || draft.pages[draft.pages.length - 1]?.id === selectedPage.id} onClick={() => movePage(1)}>↓ Descendre</button>
        </div>
        <div className="gazette-control-grid">
          <label>Modèle
            <select disabled={serverReadOnly} value={selectedPage.template} onChange={(event) => updatePage("template", event.target.value as Template)}>
              {(Object.keys(TEMPLATES) as Template[]).map((key) => <option value={key} key={key}>{TEMPLATES[key]}</option>)}
            </select>
          </label>
          <label>Article importé
            <select disabled={serverReadOnly} value={selectedPage.articleId ?? ""} onChange={(event) => updatePage("articleId", event.target.value ? Number(event.target.value) : null)}>
              <option value="">Sélectionner un article</option>
              {articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
            </select>
          </label>
          <label>Rubrique ou sous-titre<input disabled={serverReadOnly} value={selectedPage.rubric} onChange={(event) => updatePage("rubric", event.target.value)} /></label>
          <label>Intertitre colonne gauche
            <input disabled={serverReadOnly} value={selectedPage.leftHeading || ""} onChange={(event) => updatePage("leftHeading", event.target.value)} />
          </label>
          <label>Intertitre colonne droite
            <input disabled={serverReadOnly} value={selectedPage.rightHeading || ""} onChange={(event) => updatePage("rightHeading", event.target.value)} />
          </label>
          <label>Légende de photographie
            <input disabled={serverReadOnly} value={selectedPage.imageCaption || ""} onChange={(event) => updatePage("imageCaption", event.target.value)} />
          </label>
          <label>Coupure après le paragraphe n° (vide = automatique)
            <input disabled={serverReadOnly} type="number" min={1} max={999} value={selectedPage.columnBreakAt ?? ""}
              onChange={(event) => updatePage("columnBreakAt", event.target.value ? Number(event.target.value) : null)} />
          </label>
          {selectedPage.template === "portrait" && <label>Logo du commerce présenté
            <input disabled={serverReadOnly} type="file" accept="image/png,image/jpeg,image/webp"
              onChange={(event) => loadPageAsset("spotlightLogo", event.target.files?.[0])} />
          </label>}
          {selectedPage.template === "pratique" && <label>Encart publicitaire illustré
            <input disabled={serverReadOnly} type="file" accept="image/png,image/jpeg,image/webp"
              onChange={(event) => loadPageAsset("promoImage", event.target.files?.[0])} />
          </label>}
          <label>Seconde photographie (facultative)<input disabled={serverReadOnly} type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} /></label>
          <label>QR code existant (image facultative)<input disabled={serverReadOnly} type="file" accept="image/*" onChange={(event) => {
            const file = event.target.files?.[0];
            readImage(file, (value) => {
              setQrImages((images) => ({ ...images, [selectedPage.id]: value }));
              registerAsset("qrImage:" + selectedPage.id, file);
            });
          }} /></label>
        </div>
        {selectedPage.template === "pratique" && <label className="gazette-note-label">Encadré « Bon à savoir »
          <textarea disabled={serverReadOnly} rows={3} value={selectedPage.note} onChange={(event) => updatePage("note", event.target.value)} />
        </label>}
        <div className="gazette-studio-actions">
          <button type="button" onClick={() => void printProof()}>Imprimer / Exporter en PDF A4</button>
          <button type="button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2500); }}>Confirmer le brouillon local</button>
          {draft.pages.length > 1 && !serverReadOnly && <button type="button" className="gazette-remove-page" onClick={removePage}>Supprimer cette page</button>}
        </div>
        {saved && <p role="status" className="gazette-studio-notice">Brouillon enregistré dans ce navigateur uniquement.</p>}
        {error && <p role="alert" className="gazette-studio-error">{error}</p>}
        {currentArticle && (currentArticle.body?.length ?? 0) > 3800 && <p className="gazette-studio-warning">Article long : vérifiez visuellement le débordement dans l'aperçu d'impression. La découpe automatique d'un article sur plusieurs pages reste à consolider.</p>}
        <p className="gazette-studio-help">Les textes viennent de l'éditeur d'articles. Les logos, photos et QR sont conservés après l'enregistrement du brouillon sur le serveur. Vérifiez qu'un QR téléchargé est scannable avant impression. Utilisez « Enregistrer sur le serveur » avant de figer le numéro.</p>
      </div>
    </div>
    <div className="gazette-proof-scroller">
      {draft.pages.map((page) => {
        const live = articles.find((article) => article.id === page.articleId);
        const article = page.article_snapshot
          ? {
              id: page.article_snapshot.id,
              title: page.article_snapshot.title, slug: live?.slug ?? "",
              category: live?.category ?? "local_news",
              excerpt: page.article_snapshot.excerpt ?? undefined,
              body: page.article_snapshot.body ?? undefined,
              cover_image_url: mediaUrl(page.article_snapshot.cover_image_url) ?? live?.cover_image_url,
            }
          : live;
        return <GazetteSheet key={page.id} draft={draft} page={page}
          article={article} extraImage={extraImages[page.id]} qrImage={qrImages[page.id]}
          spotlightLogo={spotlightLogos[page.id]} promoImage={promoImages[page.id]}
          headerLogo={headerLogo} footerLogo={footerLogo} />;
      })}
    </div>
  </section>;
}
