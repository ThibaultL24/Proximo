// src/components/admin/admin-gazette-article-list.tsx
import {
  ARTICLE_CATEGORY_COLORS,
  ARTICLE_CATEGORY_LABELS,
  ARTICLE_STATUS_COLORS,
  ARTICLE_STATUS_LABELS,
} from "../../lib/article-labels";
import {
  AdminActionButton,
  AdminActionLink,
  AdminBadge,
  AdminTableActions,
} from "./admin-ui";
import { Card } from "../ui/card";
import type { Article } from "../../types";

function formatDate(iso?: string) {
  if (!iso) return "Non publie";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface AdminGazetteArticleListProps {
  articles: Article[];
  editBasePath: string;
  deletingId: number | null;
  onDelete: (id: number, title: string) => void;
}

export function AdminGazetteArticleList({
  articles,
  editBasePath,
  deletingId,
  onDelete,
}: AdminGazetteArticleListProps) {
  return (
    <div className="space-y-3">
      {articles.map((article) => {
        const category = article.category || "local_news";
        const status = article.status || "draft";
        const categoryClass = ARTICLE_CATEGORY_COLORS[category] || "bg-sand text-petrol border-sand-dark/40";

        return (
          <Card
            key={article.id}
            className="group overflow-hidden p-0 transition hover:border-petrol/20 hover:shadow-md"
          >
            <div className="flex flex-col sm:flex-row">
              <div className={`hidden w-1.5 shrink-0 sm:block ${categoryClass.split(" ")[0]}`} />

              <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${categoryClass}`}
                    >
                      {ARTICLE_CATEGORY_LABELS[category] || category}
                    </span>
                    <AdminBadge className={ARTICLE_STATUS_COLORS[status] || "bg-sand text-petrol"}>
                      {ARTICLE_STATUS_LABELS[status] || status}
                    </AdminBadge>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-petrol">{article.title}</h3>

                  {article.excerpt && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                    {article.place?.name && (
                      <span>
                        <span className="font-medium text-petrol/80">Territoire</span> · {article.place.name}
                      </span>
                    )}
                    {article.merchant && (
                      <span>
                        <span className="font-medium text-petrol/80">Commercant</span> · {article.merchant.name}
                      </span>
                    )}
                    <span>
                      <span className="font-medium text-petrol/80">Publication</span> · {formatDate(article.published_at)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                  <AdminTableActions>
                    {status === "published" && (
                      <AdminActionLink to={`/gazette/${article.slug}`} target="_blank">
                        Voir en ligne
                      </AdminActionLink>
                    )}
                    <AdminActionLink to={`${editBasePath}/${article.id}/modifier`}>
                      Modifier
                    </AdminActionLink>
                    <AdminActionButton
                      disabled={deletingId === article.id}
                      onClick={() => onDelete(article.id, article.title)}
                    >
                      Supprimer
                    </AdminActionButton>
                  </AdminTableActions>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
