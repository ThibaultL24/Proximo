import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_ROOT } from "../../api/client";
import { GazetteSheet, type EditionDraft } from "../../components/gazette/gazette-sheet";
import type { GazetteEditionRecord } from "../../api/gazette-editions";

type EditionSummary = Pick<GazetteEditionRecord, "id" | "issue_label" | "edition_label" | "status" | "published_at">;
type PublicEdition = EditionSummary & Pick<GazetteEditionRecord, "settings" | "pages" | "asset_urls">;

function mediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("/") ? API_ROOT + url : url;
}

export function GazetteEditionsPage() {
  const [editions, setEditions] = useState<EditionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<EditionSummary[]>("/public/gazette_editions")
      .then(({ data }) => setEditions(data))
      .catch(() => setError("Impossible de charger les éditions de la Gazette."))
      .finally(() => setLoading(false));
  }, []);

  return <main className="mx-auto max-w-5xl space-y-8 py-8">
    <header className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e5004f]">Fenêtre Ouverte · Presse locale</p>
      <h1 className="font-serif text-4xl font-bold text-[#093969]">La Gazette</h1>
      <p className="max-w-2xl text-sm text-ink-muted">
        Portraits, conseils et actualités de nos communes. Retrouvez les numéros publiés,
        tels qu'ils ont été composés pour le papier.
      </p>
    </header>
    {loading && <p>Chargement des éditions…</p>}
    {error && <p role="alert">{error}</p>}
    {!loading && !error && editions.length === 0 && <p>Aucun numéro publié pour le moment.</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {editions.map((edition) => <Link key={edition.id} to={"/gazette/editions/" + edition.id}
        className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:shadow-md">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e5004f]">
          {edition.status === "archived" ? "Archives" : "Édition disponible"}
        </span>
        <h2 className="mt-3 font-serif text-2xl font-bold text-[#093969]">{edition.issue_label}</h2>
        <p className="mt-1 text-ink-muted">{edition.edition_label}</p>
        <p className="mt-5 text-sm font-semibold text-[#e5004f]">Lire le numéro →</p>
      </Link>)}
    </div>
  </main>;
}

export function GazetteEditionReaderPage() {
  const { id } = useParams();
  const [edition, setEdition] = useState<PublicEdition | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) { setError("Numéro introuvable."); return; }
    api.get<PublicEdition>("/public/gazette_editions/" + id)
      .then(({ data }) => setEdition(data))
      .catch(() => setError("Ce numéro n'est pas disponible."));
  }, [id]);

  if (error) return <div className="mx-auto max-w-4xl py-12"><p role="alert">{error}</p><Link to="/gazette">← Retour aux numéros</Link></div>;
  if (!edition) return <p className="p-8">Chargement du numéro…</p>;

  const draft: EditionDraft = {
    issue: edition.issue_label, edition: edition.edition_label,
    subtitle: edition.settings.subtitle, territory: edition.settings.territory,
    banner: edition.settings.banner, contact: edition.settings.contact,
    legal: edition.settings.legal, pages: edition.pages,
  };

  return <div className="space-y-6 py-6">
    <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4">
      <div>
        <Link to="/gazette" className="text-sm text-[#093969]">← Toutes les éditions</Link>
        <h1 className="mt-1 font-serif text-2xl font-bold">{edition.issue_label} · {edition.edition_label}</h1>
      </div>
      <button type="button" className="rounded-xl bg-[#e5004f] px-5 py-3 text-sm font-bold text-white" onClick={() => window.print()}>
        Imprimer / Enregistrer en PDF
      </button>
    </div>
    <div className="gazette-proof-scroller">
      {edition.pages.map((page) => {
        const source = page.article_snapshot;
        const article = source ? {
          id: source.id, slug: "", category: "local_news", title: source.title,
          excerpt: source.excerpt ?? undefined, body: source.body ?? undefined,
          cover_image_url: mediaUrl(source.cover_image_url),
        } : undefined;
        return <GazetteSheet key={page.id} draft={draft} page={page} article={article}
          headerLogo={mediaUrl(edition.asset_urls?.headerLogo)}
          footerLogo={mediaUrl(edition.asset_urls?.footerLogo)}
          extraImage={mediaUrl(edition.asset_urls?.["extraImage:" + page.id])}
          spotlightLogo={mediaUrl(edition.asset_urls?.["spotlightLogo:" + page.id])}
          promoImage={mediaUrl(edition.asset_urls?.["promoImage:" + page.id])}
          qrImage={mediaUrl(edition.asset_urls?.["qrImage:" + page.id])} />;
      })}
    </div>
  </div>;
}
