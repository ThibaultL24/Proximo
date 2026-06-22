// src/pages/admin/admin-articles-page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAdminArticle, fetchAdminArticles } from "../../api/admin-articles";
import { AdminEditorialHero } from "../../components/admin/admin-editorial-hero";
import { AdminGazetteArticleList } from "../../components/admin/admin-gazette-article-list";
import { IconFile, IconNewspaper, IconShop } from "../../components/admin/admin-icons";
import { AdminStatCard } from "../../components/admin/admin-stat-card";
import {
  AdminAlert,
  AdminBadge,
  AdminEmptyState,
  AdminFilters,
  AdminLoading,
  AdminSelect,
} from "../../components/admin/admin-ui";
import { GAZETTE_CATEGORY_OPTIONS } from "../../lib/article-labels";
import type { Article } from "../../types";

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "draft", label: "Brouillons" },
  { value: "published", label: "Publies" },
  { value: "archived", label: "Archives" },
];

const CATEGORY_FILTERS = [
  { value: "", label: "Toutes les categories" },
  ...GAZETTE_CATEGORY_OPTIONS.map(({ value, label }) => ({ value, label })),
];

export function AdminArticlesPage() {
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
        scope: "gazette",
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setArticles(data);
    } catch {
      setError("Impossible de charger les articles");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === "published").length;
    const drafts = articles.filter((a) => (a.status || "draft") === "draft").length;
    const portraits = articles.filter((a) => a.category === "merchant_spotlight").length;
    const actus = articles.filter((a) => a.category === "local_news").length;
    return { published, drafts, portraits, actus };
  }, [articles]);

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
    <section className="space-y-8">
      <AdminEditorialHero
        eyebrow="Editorial territorial"
        title="Gazette locale"
        description="Publiez actus de quartier et portraits de commercants. Chaque article est rattache a un territoire pour alimenter la gazette publique."
        icon={<IconNewspaper className="h-6 w-6 text-white" />}
        primaryAction={{ to: "/admin/articles/nouveau", label: "Nouvel article" }}
        secondaryAction={{ to: "/gazette", label: "Voir la gazette publique" }}
      />

      {!isLoading && articles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Publies"
            value={stats.published}
            hint={`${articles.length} article(s) au total`}
            icon={<IconFile />}
            accent="success"
          />
          <AdminStatCard
            label="Brouillons"
            value={stats.drafts}
            hint="En attente de publication"
            icon={<IconNewspaper />}
            accent="alert"
          />
          <AdminStatCard
            label="Portraits"
            value={stats.portraits}
            hint="Commercants mis en lumiere"
            icon={<IconShop />}
            accent="success"
          />
          <AdminStatCard
            label="Actus locales"
            value={stats.actus}
            hint="Infos de territoire"
            icon={<IconNewspaper />}
            accent="petrol"
          />
        </div>
      )}

      <AdminFilters>
        <div className="flex flex-wrap items-center gap-3">
          <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {CATEGORY_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </AdminSelect>
          {!isLoading && (
            <AdminBadge className="bg-petrol/10 text-petrol">
              {articles.length} resultat{articles.length !== 1 ? "s" : ""}
            </AdminBadge>
          )}
        </div>
      </AdminFilters>

      {error && <AdminAlert>{error}</AdminAlert>}
      {isLoading && <AdminLoading />}

      {!isLoading && articles.length === 0 && (
        <AdminEmptyState>
          Aucun article pour ce filtre.{" "}
          <Link to="/admin/articles/nouveau" className="font-medium text-brass hover:text-petrol">
            Creer le premier article
          </Link>
        </AdminEmptyState>
      )}

      {articles.length > 0 && (
        <AdminGazetteArticleList
          articles={articles}
          editBasePath="/admin/articles"
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
