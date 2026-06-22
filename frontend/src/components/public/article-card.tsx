// src/components/public/article-card.tsx
import { Link } from "react-router-dom";
import { ARTICLE_CATEGORY_LABELS } from "../../lib/article-labels";
import { territoryBadge } from "../../lib/gazette-labels";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import type { Article } from "../../types";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  showTerritory?: boolean;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleCard({ article, featured = false, showTerritory = true }: ArticleCardProps) {
  const date = formatDate(article.published_at);
  const provenance = article.gazette_label || territoryBadge(article.place, article.territory_label);

  return (
    <Link to={`/gazette/${article.slug}`} className="group block">
      <Card hover className={featured ? "border-petrol/20 bg-gradient-to-br from-surface to-paper" : ""}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="category">
            {(article.category && ARTICLE_CATEGORY_LABELS[article.category]) || "Gazette"}
          </Badge>
          {showTerritory && provenance && (
            <Badge variant="partner">{provenance}</Badge>
          )}
        </div>
        <h2 className={`font-serif font-semibold text-petrol group-hover:text-brass ${featured ? "text-2xl" : "text-xl"}`}>
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
        )}
        {date && <p className="mt-4 text-xs text-ink-muted/70">Publié le {date}</p>}
      </Card>
    </Link>
  );
}
