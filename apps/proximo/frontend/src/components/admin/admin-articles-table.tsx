// src/components/admin/admin-articles-table.tsx
import {
  ARTICLE_CATEGORY_LABELS,
  ARTICLE_STATUS_COLORS,
  ARTICLE_STATUS_LABELS,
} from "../../lib/article-labels";
import {
  AdminActionButton,
  AdminActionLink,
  AdminTable,
  AdminTableActions,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "./admin-ui";
import type { Article } from "../../types";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface AdminArticlesTableProps {
  articles: Article[];
  editBasePath: string;
  deletingId: number | null;
  onDelete: (id: number, title: string) => void;
  territoryFallback?: string;
}

export function AdminArticlesTable({
  articles,
  editBasePath,
  deletingId,
  onDelete,
  territoryFallback = "—",
}: AdminArticlesTableProps) {
  return (
    <AdminTable>
      <AdminTableHead>
        <tr>
          <th className="px-4 py-3 font-medium">Titre</th>
          <th className="px-4 py-3 font-medium">Categorie</th>
          <th className="px-4 py-3 font-medium">Territoire</th>
          <th className="px-4 py-3 font-medium">Statut</th>
          <th className="px-4 py-3 font-medium">Publication</th>
          <th className="px-4 py-3 font-medium">Actions</th>
        </tr>
      </AdminTableHead>
      <tbody>
        {articles.map((article) => (
          <AdminTableRow key={article.id}>
            <AdminTableCell>
              <p className="font-medium text-petrol">{article.title}</p>
              {article.merchant && <p className="mt-0.5 text-xs text-ink-muted">{article.merchant.name}</p>}
            </AdminTableCell>
            <AdminTableCell className="text-ink-muted">
              {ARTICLE_CATEGORY_LABELS[article.category] || article.category}
            </AdminTableCell>
            <AdminTableCell className="text-ink-muted">
              {article.place?.name || territoryFallback}
            </AdminTableCell>
            <AdminTableCell>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ARTICLE_STATUS_COLORS[article.status || "draft"] || ""}`}>
                {ARTICLE_STATUS_LABELS[article.status || "draft"] || article.status}
              </span>
            </AdminTableCell>
            <AdminTableCell className="text-ink-muted">{formatDate(article.published_at)}</AdminTableCell>
            <AdminTableCell>
              <AdminTableActions>
                {article.status === "published" && (
                  <AdminActionLink to={`/gazette/${article.slug}`} target="_blank">
                    Voir
                  </AdminActionLink>
                )}
                <AdminActionLink to={`${editBasePath}/${article.id}/modifier`}>Modifier</AdminActionLink>
                <AdminActionButton
                  disabled={deletingId === article.id}
                  onClick={() => onDelete(article.id, article.title)}
                >
                  Supprimer
                </AdminActionButton>
              </AdminTableActions>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </tbody>
    </AdminTable>
  );
}
