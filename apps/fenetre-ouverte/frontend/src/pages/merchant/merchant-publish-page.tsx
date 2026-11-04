// src/pages/merchant/merchant-publish-page.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createMerchantPublication, fetchMerchantPublications } from "../../api/merchant-publications";
import { fetchDistributionChannels, type DistributionChannel } from "../../api/distribution-channels";
import {
  connectSocialProvider,
  disconnectSocialAccount,
  fetchSocialAccounts,
  type SocialProviderStatus,
} from "../../api/merchant-social";
import {
  AdminAlert,
  AdminLoading,
  AdminPageHeader,
} from "../../components/admin/admin-ui";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import { Badge } from "../../components/ui/badge";
import { linkButtonClass } from "../../components/ui/button";
import { FEED_CATEGORIES, SOCIAL_PROVIDERS, SOCIAL_POST_STATUS_LABELS, type FeedCategory } from "../../lib/feed-categories";
import { MerchantSubscriptionCard } from "../../components/merchant/merchant-subscription-card";
import type { Publication, SocialProvider } from "../../types";

const STATUS_BADGE: Record<string, "default" | "featured" | "soon" | "partner"> = {
  published: "featured",
  pending: "soon",
  failed: "partner",
  skipped: "default",
};

export function MerchantPublishPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<FeedCategory>("commerces");
  const [image, setImage] = useState<File | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [providers, setProviders] = useState<SocialProviderStatus[]>([]);
  const [channels, setChannels] = useState<DistributionChannel[]>([]);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);
  const [selected, setSelected] = useState<SocialProvider[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connecting, setConnecting] = useState<SocialProvider | null>(null);

  async function loadAll() {
    const [pubs, social, catalog] = await Promise.all([
      fetchMerchantPublications(),
      fetchSocialAccounts(),
      fetchDistributionChannels(),
    ]);
    setChannels(catalog);
    setPublications(pubs);
    setProviders(social.providers);
    setSelected(social.providers.filter((p) => p.connected).map((p) => p.provider));
  }

  useEffect(() => {
    loadAll()
      .catch(() => setError("Impossible de charger vos publications"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const social = searchParams.get("social");
    const status = searchParams.get("status");
    const oauthMessage = searchParams.get("message");
    if (!social || !status) return;

    if (status === "ok") {
      setMessage(`${labelFor(social)} connecté.`);
      loadAll().catch(() => undefined);
    } else {
      setError(oauthMessage || `Connexion ${labelFor(social)} échouée.`);
    }

    const next = new URLSearchParams(searchParams);
    next.delete("social");
    next.delete("status");
    next.delete("message");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const configuredProviders = useMemo(() => providers, [providers]);

  const connectedCount = useMemo(
    () => configuredProviders.filter((p) => p.connected).length,
    [configuredProviders]
  );

  const hasAnyPageConfigured = configuredProviders.some((p) => p.page_configured);

  function toggleProvider(provider: SocialProvider) {
    setSelected((current) =>
      current.includes(provider) ? current.filter((p) => p !== provider) : [...current, provider]
    );
  }

  async function handleConnect(provider: SocialProvider) {
    setError("");
    setMessage("");
    setConnecting(provider);
    try {
      const result = await connectSocialProvider(provider);
      if (result.mode === "oauth" && result.url) {
        window.location.href = result.url;
        return;
      }
      setMessage(`${labelFor(provider)} est disponible en mode simulation uniquement : aucune publication extérieure ne sera envoyée.`);
      await loadAll();
    } catch (err: unknown) {
      const apiError =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(apiError || `Impossible de connecter ${labelFor(provider)}.`);
    } finally {
      setConnecting(null);
    }
  }

  async function handleDisconnect(provider: SocialProvider) {
    setError("");
    try {
      await disconnectSocialAccount(provider);
      setSelected((current) => current.filter((p) => p !== provider));
      await loadAll();
      setMessage(`${labelFor(provider)} déconnecté.`);
    } catch {
      setError(`Impossible de déconnecter ${labelFor(provider)}.`);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const syndicate = selected.length > 0;

    try {
      const publication = await createMerchantPublication({
        body,
        category,
        image: image || undefined,
        syndicate,
        providers: selected,
      });
      setPublications((current) => [publication, ...current]);
      setBody("");
      setImage(null);
      setMessage(
        selected.length > 0
          ? "Publication envoyée à la modération. Après validation, les envois externes autorisés seront suivis séparément dans l'historique."
          : "Publication envoyée à la modération. Après validation, elle apparaîtra sur Fenêtre Ouverte."
      );
    } catch {
      setError("Publication impossible. Vérifiez votre abonnement actif.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyPublication(publication: Publication) {
    const link = window.location.origin + "/fil/post/" + publication.id;
    const text = publication.body + "\n\n" + link;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(publication.id);
      setError("");
    } catch {
      setError("Impossible de copier automatiquement. Sélectionnez le texte de la publication.");
    }
  }

  if (isLoading) return <AdminLoading />;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Fenêtre Ouverte"
        title="Atelier de diffusion"
        description="Rédigez une seule fois, faites valider par la rédaction, puis suivez chaque réseau autorisé. Les réseaux non connectés restent des possibilités de partage manuel."
        backTo=""
      />

      <div className="grid gap-3 md:grid-cols-4" aria-label="Étapes de publication">
        {[
          ["01", "Rédiger", "Texte, photo et rubrique"],
          ["02", "Sélectionner", "Comptes réellement autorisés"],
          ["03", "Faire valider", "Contrôle éditorial de Jean-Michel"],
          ["04", "Distribuer", "Statut par plateforme et partage"],
        ].map(([number, title, description]) => (
          <div key={number} className="rounded-xl border border-[#d5e0ee] bg-white p-4">
            <span className="text-xs font-extrabold tracking-widest text-[#d17a15]">ÉTAPE {number}</span>
            <h2 className="mt-2 text-base font-extrabold text-[#0b4c93]">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>
          </div>
        ))}
      </div>
      <details className="rounded-xl border border-line bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-petrol">Abonnement et conditions de publication</summary>
        <div className="mt-3"><MerchantSubscriptionCard /></div>
      </details>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <AdminPanelCard title="Réseaux connectés">
            <p className="mb-4 text-sm text-ink-muted">
              Renseignez d&apos;abord vos pages sur{" "}
              <Link to="/espace-commercant/ma-fiche" className="font-medium text-petrol underline">
                Ma fiche vitrine
              </Link>
              , puis connectez chaque réseau. Avec les clés plateforme (super-admin), Connecter ouvre OAuth
              Meta / TikTok. Sans autorisations valides, une connexion <strong>démo</strong> ne publie jamais réellement.
            </p>

            {!hasAnyPageConfigured && (
              <p className="rounded-lg border border-line bg-paper px-3 py-3 text-sm text-ink-muted">
                Aucune page réseau renseignée. Ajoutez Facebook, Instagram ou TikTok sur votre fiche pour
                activer la syndication.
              </p>
            )}

            <div className="space-y-3">
              {configuredProviders.map((status) => {
                const provider = SOCIAL_PROVIDERS.find((p) => p.id === status.provider);
                if (!provider) return null;
                const connected = Boolean(status.connected);
                const checked = selected.includes(provider.id);

                return (
                  <div
                    key={provider.id}
                    className={`rounded-lg border px-3 py-3 ${
                      connected ? "border-line bg-paper" : "border-dashed border-line bg-surface/50 opacity-90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{provider.label}</p>
                        {status.page_label && (
                          <p className="mt-0.5 text-xs text-ink-muted">{status.page_label}</p>
                        )}
                        {connected ? (
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {status.account_name}
                            {status.demo ? " · Mode démo" : " · Connecté"}
                            {!status.oauth_configured && status.demo ? " (clés API absentes)" : ""}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {status.demo ? "Simulation uniquement — aucun envoi réel" : !status.page_configured ? "Complétez d’abord votre fiche" : status.oauth_configured ? "OAuth à autoriser" : "Mode démo disponible"}
                          </p>
                        )}
                      </div>
                      {connected ? (
                        <button
                          type="button"
                          onClick={() => handleDisconnect(provider.id)}
                          className="text-xs font-semibold text-ink-muted hover:text-ink"
                        >
                          Déconnecter
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={connecting === provider.id || !status.page_configured}
                          onClick={() => handleConnect(provider.id)}
                          className={linkButtonClass("outline", "text-xs")}
                        >
                          {connecting === provider.id ? "…" : "Connecter"}
                        </button>
                      )}
                    </div>
                    <label
                      className={`mt-3 flex items-center gap-2 text-sm ${
                        connected ? "cursor-pointer text-ink" : "cursor-not-allowed text-ink-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={connected && checked}
                        disabled={!connected}
                        onChange={() => connected && toggleProvider(provider.id)}
                        className="rounded border-line disabled:opacity-50"
                      />
                      Publier aussi sur {provider.label}
                    </label>
                  </div>
                );
              })}
            </div>
            {hasAnyPageConfigured && connectedCount === 0 && (
              <p className="mt-4 text-xs text-ink-muted">
                Connectez au moins un réseau pour diffuser en une fois hors du fil.
              </p>
            )}
          </AdminPanelCard>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-3">
          <AdminPanelCard title="Nouvelle publication">
            {message && (
              <div className="mb-4 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
                {message}
              </div>
            )}
            {error && <AdminAlert>{error}</AdminAlert>}

            <label className="block text-sm font-medium text-ink">
              Rubrique
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedCategory)}
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm"
              >
                {FEED_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-medium text-ink">
              Votre message
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Ex. : Nouvelle spécialité ce week-end, horaires d'été..."
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm"
              />
            </label>
            <p className="mt-1 text-xs text-ink-muted">
              Sur les réseaux, signature ajoutée : — via Fenêtre Ouverte · 07700
            </p>

            <label className="mt-4 block text-sm font-medium text-ink">
              Photo (optionnel)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-ink-muted"
              />
            </label>
            <p className="mt-1 text-xs text-ink-muted">
              Instagram et TikTok live exigent une photo HTTPS publique ; en démo, la publication reste simulée
              sans image.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${linkButtonClass("accent")} mt-6 w-full justify-center`}
            >
              {isSubmitting
                ? "Publication..."
                : selected.length > 0
                  ? `Soumettre pour le fil + ${selected.length} réseau${selected.length > 1 ? "x" : ""}`
                  : "Soumettre à validation"}
            </button>
          </AdminPanelCard>
        </form>
      </div>

      <AdminPanelCard title="Autres canaux de diffusion — transparence des possibilités">
        <p className="mb-4 text-sm text-ink-muted">
          Ces destinations ne sont pas toutes connectées. Elles n'autorisent aucun envoi automatique
          avant intégration officielle, consentement du compte et éventuel accord sur les frais.
          Vous pouvez néanmoins copier une publication déjà validée pour la partager vous-même.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => (
            <div key={channel.id} className="rounded-xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <strong className="text-sm text-petrol">{channel.label}</strong>
                <Badge variant={channel.connected_live ? "featured" : "default"}>
                  {channel.connected_live ? "Compte autorisé"
                    : channel.demo ? "Simulation"
                    : channel.mode === "oauth" ? "Connexion à préparer"
                    : channel.mode === "paid" ? "API payante"
                    : channel.mode === "partner" ? "Blog autorisé"
                    : "Intégration future"}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">{channel.notes}</p>
            </div>
          ))}
        </div>
      </AdminPanelCard>

      {publications.length > 0 && (
        <AdminPanelCard title="Historique">
          <div className="space-y-3">
            {publications.map((publication) => (
              <div key={publication.id} className="rounded-lg border border-line bg-paper p-4">
                <p className="whitespace-pre-wrap text-sm text-ink">{publication.body}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-ink-muted">{publication.category}</span>
                  {publication.status === "pending_review" && <Badge variant="soon">En attente de validation</Badge>}
                  {publication.status === "rejected" && <Badge variant="partner">Refusé</Badge>}
                  {publication.syndicated && (
                    <Badge variant="featured">Syndiqué</Badge>
                  )}
                </div>
                {publication.status === "published" && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => void copyPublication(publication)}
                      className={linkButtonClass("outline", "text-xs")}>
                      Copier le texte et le lien pour un partage manuel
                    </button>
                    {copySuccess === publication.id && <span className="text-xs text-success">Copié</span>}
                  </div>
                )}
                {publication.social_posts?.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {publication.social_posts.map((post) => (
                      <li key={post.id}>
                        <Badge variant={STATUS_BADGE[post.status] || "default"}>
                          {labelFor(post.provider)} ·{" "}
                          {SOCIAL_POST_STATUS_LABELS[post.status] || post.status}
                          {post.error_message ? ` — ${post.error_message}` : ""}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </AdminPanelCard>
      )}
    </section>
  );
}

function labelFor(provider: string) {
  return SOCIAL_PROVIDERS.find((p) => p.id === provider)?.label || provider;
}
