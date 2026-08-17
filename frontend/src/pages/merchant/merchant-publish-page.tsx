// src/pages/merchant/merchant-publish-page.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createMerchantPublication, fetchMerchantPublications } from "../../api/merchant-publications";
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
  const [selected, setSelected] = useState<SocialProvider[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connecting, setConnecting] = useState<SocialProvider | null>(null);

  async function loadAll() {
    const [pubs, social] = await Promise.all([
      fetchMerchantPublications(),
      fetchSocialAccounts(),
    ]);
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

  const hasAnyPageConfigured = configuredProviders.length > 0;

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
      setMessage(`${labelFor(provider)} connecté en mode démo (ajoutez les clés API pour le live).`);
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
      const networkNote =
        selected.length > 0
          ? ` + ${selected.length} réseau${selected.length > 1 ? "x" : ""}.`
          : ".";
      setMessage(`Publication mise en ligne sur le fil Fenêtre Ouverte${networkNote}`);
    } catch {
      setError("Publication impossible. Vérifiez votre abonnement actif.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <AdminLoading />;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Fenêtre Ouverte"
        title="Publier"
        description="Une rédaction, le fil du 07700, et Facebook / Instagram / TikTok si connectés. Signature Fenêtre Ouverte ajoutée sur les réseaux."
        backTo=""
      />

      <MerchantSubscriptionCard />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <AdminPanelCard title="Réseaux connectés">
            <p className="mb-4 text-sm text-ink-muted">
              Renseignez d&apos;abord vos pages sur{" "}
              <Link to="/espace-commercant/ma-fiche" className="font-medium text-petrol underline">
                Ma fiche vitrine
              </Link>
              , puis connectez chaque réseau. Sans clés Meta / TikTok, la connexion crée un compte{" "}
              <strong>démo</strong> (syndication simulée).
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
                            {status.oauth_configured ? "OAuth prêt — connectez pour publier" : "Mode démo disponible"}
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
                          disabled={connecting === provider.id}
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
              Instagram live exige une photo ; en démo, la publication reste simulée sans image.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${linkButtonClass("accent")} mt-6 w-full justify-center`}
            >
              {isSubmitting
                ? "Publication..."
                : selected.length > 0
                  ? `Publier sur le fil + ${selected.length} réseau${selected.length > 1 ? "x" : ""}`
                  : "Publier sur Fenêtre Ouverte"}
            </button>
          </AdminPanelCard>
        </form>
      </div>

      {publications.length > 0 && (
        <AdminPanelCard title="Historique">
          <div className="space-y-3">
            {publications.map((publication) => (
              <div key={publication.id} className="rounded-lg border border-line bg-paper p-4">
                <p className="whitespace-pre-wrap text-sm text-ink">{publication.body}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-ink-muted">{publication.category}</span>
                  {publication.syndicated && (
                    <Badge variant="featured">Syndiqué</Badge>
                  )}
                </div>
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
