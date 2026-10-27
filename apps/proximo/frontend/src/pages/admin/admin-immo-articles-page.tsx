// src/pages/admin/admin-immo-articles-page.tsx
import { useCallback, useEffect, useState } from "react";
import { deleteAdminArticle, fetchAdminArticles } from "../../api/admin-articles";
import { AdminArticlesTable } from "../../components/admin/admin-articles-table";
import {
  AdminAlert,
  AdminEmptyState,
  AdminFilters,
  AdminLoading,
  AdminPageHeader,
  AdminPrimaryLink,
  AdminSelect,
} from "../../components/admin/admin-ui";
import { IMMO_CATEGORY_OPTIONS } from "../../lib/article-labels";
import type { Article } from "../../types";

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "draft", label: "Brouillons" },
  { value: "published", label: "Publies" },
  { value: "archived", label: "Archives" },
];

export function AdminImmoArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchAdminArticles({
        scope: "immo",
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setArticles(data);
    } catch {
      setError("Impossible de charger les articles immo");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`Supprimer "${title}" ?`)) return;

    setDeletingId(id);
    setError("");
    try {
      await deleteAdminArticle(id);
      await loadArticles();
    } catch {
      setError("Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="Editorial agence"
        title="Articles immo"
        description="Contenus techniques et editoriaux agence — reserves au detenteur de l'application."
        backLabel="Vue d'ensemble"
        action={<AdminPrimaryLink to="/admin/immo/nouveau">Nouvel article immo</AdminPrimaryLink>}
      />

      <AdminFilters>
        <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </AdminSelect>
        <AdminSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Toutes les categories</option>
          {IMMO_CATEGORY_OPTIONS.map((filter) => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </AdminSelect>
      </AdminFilters>

      {error && <AdminAlert>{error}</AdminAlert>}
      {isLoading && <AdminLoading />}

      {!isLoading && articles.length === 0 && (
        <AdminEmptyState>Aucun article immo pour ce filtre.</AdminEmptyState>
      )}

      {articles.length > 0 && (
        <AdminArticlesTable
          articles={articles}
          editBasePath="/admin/immo"
          deletingId={deletingId}
          onDelete={handleDelete}
          territoryFallback="National"
        />
      )}
    </section>
  );
}
