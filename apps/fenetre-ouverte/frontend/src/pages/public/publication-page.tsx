// src/pages/public/publication-page.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublication } from "../../api/reviews";
import { ReviewSection } from "../../components/public/review-section";
import { FEED_CATEGORY_LABELS } from "../../lib/feed-categories";
import { useAuth } from "../../hooks/use-auth";
import type { PublicationDetail } from "../../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PublicationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [publication, setPublication] = useState<PublicationDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchPublication(Number(id))
      .then(setPublication)
      .catch(() => setError("Publication introuvable"));
  }, [id]);

  if (error) {
    return (
      <p className="text-alert">
        {error}.{" "}
        <Link to="/fil" className="font-semibold text-tile hover:underline">
          Retour au fil
        </Link>
      </p>
    );
  }

  if (!publication) return <p className="text-ink-muted">Chargement...</p>;

  const canReply = Boolean(user?.role === "merchant" && user.merchant_id === publication.merchant.id);

  return (
    <article className="mx-auto max-w-3xl space-y-8 pb-16">
      <Link to="/fil" className="text-sm font-semibold text-tile hover:underline">
        &larr; Retour au fil
      </Link>

      <header className="space-y-4 border-b border-line pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tile">
          Post · {FEED_CATEGORY_LABELS[publication.category]}
        </p>
        <div className="flex items-center gap-3">
          {publication.merchant.logo_url ? (
            <img
              src={publication.merchant.logo_url}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dark font-serif text-lg font-semibold">
              {publication.merchant.name.slice(0, 1)}
            </div>
          )}
          <div>
            <Link
              to={`/commercants/${publication.merchant.slug}`}
              className="font-serif text-xl font-semibold text-ink hover:text-tile"
            >
              {publication.merchant.name}
            </Link>
            <p className="text-sm text-ink-muted">{formatDate(publication.published_at)}</p>
          </div>
        </div>
      </header>

      {publication.image_url && (
        <img
          src={publication.image_url}
          alt=""
          className="aspect-[16/10] w-full object-cover"
        />
      )}

      <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink">{publication.body}</p>

      <ReviewSection
        reviewableType="Publication"
        reviewableId={publication.id}
        canReply={canReply}
      />
    </article>
  );
}
