// src/components/public/review-section.tsx
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createReview, fetchReviews, replyToReview } from "../../api/reviews";
import { useAuth } from "../../hooks/use-auth";
import { linkButtonClass } from "../ui/button";
import type { Review, ReviewableType } from "../../types";

interface ReviewSectionProps {
  reviewableType: ReviewableType;
  reviewableSlug?: string;
  reviewableId?: number;
  canReply?: boolean;
  title?: string;
}

function StarRating({ value }: { value?: number | null }) {
  if (!value) return null;
  return (
    <p className="text-sm text-tile" aria-label={`Note ${value} sur 5`}>
      {"★".repeat(value)}
      <span className="text-ink-muted/40">{"★".repeat(5 - value)}</span>
    </p>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ReviewSection({
  reviewableType,
  reviewableSlug,
  reviewableId,
  canReply = false,
  title = "Avis",
}: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchReviews({
        reviewable_type: reviewableType,
        reviewable_slug: reviewableSlug,
        reviewable_id: reviewableId,
      });
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [reviewableType, reviewableSlug, reviewableId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const hasReviewed = user ? reviews.some((review) => review.author_id === user.id) : false;
  const canWriteReview = user && (user.role === "client" || user.role === "merchant");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    setError("");
    try {
      await createReview({
        reviewable_type: reviewableType,
        reviewable_slug: reviewableSlug,
        reviewable_id: reviewableId,
        body: body.trim(),
        rating: rating === "" ? undefined : Number(rating),
      });
      setBody("");
      setRating("");
      await loadReviews();
    } catch {
      setError("Impossible d'envoyer votre avis. Vous avez peut-être deja commente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReply(reviewId: number) {
    const draft = replyDrafts[reviewId]?.trim();
    if (!draft) return;

    setIsSubmitting(true);
    setError("");
    try {
      await replyToReview(reviewId, { body: draft });
      setReplyDrafts((current) => ({ ...current, [reviewId]: "" }));
      await loadReviews();
    } catch {
      setError("Impossible d'envoyer la reponse.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-5 border-t border-line pt-8" aria-labelledby="reviews-heading">
      <div>
        <h2 id="reviews-heading" className="font-serif text-2xl font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Un avis par personne. Le commercant ou l&apos;agence peut repondre une fois.
        </p>
      </div>

      {isLoading && <p className="text-sm text-ink-muted">Chargement des avis...</p>}

      {!isLoading && reviews.length === 0 && (
        <p className="rounded-lg border border-line bg-paper/40 px-4 py-3 text-sm text-ink-muted">
          Aucun avis pour le moment. Soyez le premier a partager votre experience.
        </p>
      )}

      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">{review.author_name}</p>
                <p className="text-xs text-ink-muted">{formatDate(review.created_at)}</p>
              </div>
              <StarRating value={review.rating} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{review.body}</p>

            {review.reply && (
              <div className="mt-4 border-l-2 border-tile/40 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-tile">Reponse</p>
                <p className="mt-1 text-sm font-semibold text-ink">{review.reply.author_name}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                  {review.reply.body}
                </p>
              </div>
            )}

            {canReply && !review.reply && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={replyDrafts[review.id] || ""}
                  onChange={(event) =>
                    setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))
                  }
                  rows={2}
                  placeholder="Repondre a cet avis..."
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleReply(review.id)}
                  className={linkButtonClass("outline", "text-sm")}
                >
                  Publier la reponse
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {!user && (
        <p className="text-sm text-ink-muted">
          <Link to="/connexion" className="font-semibold text-tile hover:underline">
            Connectez-vous
          </Link>{" "}
          pour laisser un avis.
        </p>
      )}

      {user && canWriteReview && !hasReviewed && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-line bg-paper/30 p-4">
          <p className="text-sm font-semibold text-ink">Laisser un avis</p>
          <label className="block text-sm text-ink-muted">
            Note (optionnelle)
            <select
              value={rating}
              onChange={(event) => setRating(event.target.value === "" ? "" : Number(event.target.value))}
              className="mt-1 block w-full max-w-xs rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            >
              <option value="">Sans note</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            required
            placeholder="Partagez votre experience..."
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-alert">{error}</p>}
          <button type="submit" disabled={isSubmitting} className={linkButtonClass("accent", "text-sm")}>
            {isSubmitting ? "Envoi..." : "Publier mon avis"}
          </button>
        </form>
      )}

      {user && canWriteReview && hasReviewed && (
        <p className="text-sm text-ink-muted">Vous avez deja laisse un avis ici.</p>
      )}
    </section>
  );
}
