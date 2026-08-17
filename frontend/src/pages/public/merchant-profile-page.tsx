// src/pages/public/merchant-profile-page.tsx
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import { ArticleCard } from "../../components/public/article-card";
import { ReviewSection } from "../../components/public/review-section";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { linkButtonClass } from "../../components/ui/button";
import { fetchMerchant } from "../../api/public";
import { formatOpeningHours } from "../../lib/opening-hours";
import type { MerchantDetail } from "../../types";

export function MerchantProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const fromQr = searchParams.get("source") === "qr";
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetchMerchant(slug)
      .then(setMerchant)
      .catch(() => setError("Commerçant introuvable ou non publié"));
  }, [slug]);

  if (error) {
    return (
      <Card className="text-center">
        <p className="text-alert">{error}</p>
        <Link to="/commerces" className="mt-4 inline-block text-sm font-medium text-petrol">
          Voir les commerces
        </Link>
      </Card>
    );
  }

  if (!merchant) return <p className="text-ink-muted">Chargement…</p>;

  const openingHours = merchant.opening_hours ? formatOpeningHours(merchant.opening_hours) : [];

  const mapsUrl = merchant.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${merchant.address} ${merchant.postal_code} ${merchant.city}`
      )}`
    : null;

  return (
    <article className="space-y-5">
      {fromQr && (
        <div className="rounded-2xl border border-petrol/15 bg-petrol/5 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-tile">Bienvenue sur Fenêtre Ouverte</p>
          <p className="mt-1 text-sm text-ink">
            Vous visitez <strong>{merchant.name}</strong> — fiche, horaires et actus du 07700.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-sand-dark/50 bg-surface">
        <div className="relative flex h-44 items-end bg-gradient-to-br from-sand via-paper-dark to-sand/50 p-6 sm:h-56">
          {(merchant.logo_url || merchant.photo_urls?.[0]) && (
            <img
              src={merchant.logo_url || merchant.photo_urls?.[0]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
          )}
          <div className="relative">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="partner">Commerce partenaire</Badge>
              {merchant.featured && <Badge variant="featured">Recommande</Badge>}
            </div>
            <h1 className="font-serif text-3xl font-semibold text-petrol sm:text-4xl">{merchant.name}</h1>
            <p className="mt-1 text-ink-muted">
              {merchant.place?.name || merchant.sector.name}
              {merchant.city ? ` · ${merchant.city}` : ""}
            </p>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {!fromQr && (
            <Link to="/commerces" className="text-sm font-medium text-brass hover:text-petrol">
              &larr; Retour aux commerces
            </Link>
          )}

          {merchant.short_description && (
            <p className="font-serif text-xl leading-relaxed text-ink/90">{merchant.short_description}</p>
          )}
          {merchant.description && (
            <p className="whitespace-pre-wrap leading-relaxed text-ink-muted">{merchant.description}</p>
          )}

          {merchant.photo_urls && merchant.photo_urls.length > 0 && (
            <div>
              <h2 className="mb-3 font-serif text-xl font-semibold text-petrol">Galerie</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {merchant.photo_urls.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Photo de ${merchant.name}`}
                    className="aspect-[4/3] rounded-xl border border-sand-dark/50 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {merchant.articles && merchant.articles.length > 0 && (
            <div>
              <h2 className="mb-4 font-serif text-xl font-semibold text-petrol">Dans le fil</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {merchant.articles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} featured={index === 0} />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {merchant.address && (
              <Card className="bg-paper/50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-brass">Adresse</dt>
                <dd className="mt-1 text-sm">{merchant.address}, {merchant.postal_code} {merchant.city}</dd>
              </Card>
            )}
            {merchant.phone && (
              <Card className="bg-paper/50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-brass">Telephone</dt>
                <dd className="mt-1">
                  <a href={`tel:${merchant.phone}`} className="text-lg font-medium text-petrol">{merchant.phone}</a>
                </dd>
              </Card>
            )}
            {openingHours.length > 0 && (
              <Card className="bg-paper/50 p-4 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-brass">Horaires</dt>
                <dd className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {openingHours.map(({ day, label, hours }) => (
                    <div key={day} className="flex justify-between gap-4 text-sm">
                      <span className="text-ink-muted">{label}</span>
                      <span className="font-medium text-petrol">{hours}</span>
                    </div>
                  ))}
                </dd>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {merchant.phone && (
              <a href={`tel:${merchant.phone}`} className={linkButtonClass("primary", "text-center sm:flex-1")}>
                Appeler
              </a>
            )}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className={linkButtonClass("outline", "text-center sm:flex-1")}>
                Itinéraire
              </a>
            )}
            <Link to="/fil" className={linkButtonClass("ghost", "text-center sm:flex-1")}>
              Lire le fil
            </Link>
          </div>

          <Card className="border-brass/20 bg-gradient-to-r from-sand/30 to-paper p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brass">Immobilier</p>
            <p className="mt-1 font-serif text-lg text-petrol">Vous avez un projet immobilier ?</p>
            <p className="mt-1 text-sm text-ink-muted">
              Vente, achat ou estimation — nos équipes accompagnent les habitants du secteur.
            </p>
            <Link
              to={
                user?.role === "client"
                  ? `/espace-client/leads/nouveau?merchant=${merchant.slug}`
                  : user
                    ? "/espace-client"
                    : `/inscription?merchant=${merchant.slug}`
              }
              className={`${linkButtonClass("accent")} mt-4`}
            >
              {user?.role === "client" ? "Transmettre mon projet" : "Contacter l'agence"}
            </Link>
          </Card>

          <ReviewSection
            reviewableType="Merchant"
            reviewableSlug={merchant.slug}
            canReply={Boolean(user?.role === "merchant" && user.merchant_id === merchant.id)}
          />

          {fromQr && (
            <div className="border-t border-sand-dark/50 pt-4">
              <Link to="/commerces" className="text-sm text-ink-muted hover:text-petrol">
                Découvrir les autres commerçants du quartier →
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
