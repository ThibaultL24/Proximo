// src/pages/admin/admin-article-form-page.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createAdminArticle,
  fetchAdminArticle,
  updateAdminArticle,
} from "../../api/admin-articles";
import { fetchAdminMerchants } from "../../api/admin-merchants";
import { AdminEditorialHero } from "../../components/admin/admin-editorial-hero";
import { IconBuilding, IconNewspaper } from "../../components/admin/admin-icons";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import { PlaceSelect } from "../../components/admin/place-select";
import {
  AdminAlert,
  AdminBadge,
  AdminFieldset,
  AdminFormActions,
  AdminFormLabel,
  AdminFormShell,
  AdminHint,
  AdminLoading,
  AdminSelect,
  adminInputClass,
} from "../../components/admin/admin-ui";
import { linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  ARTICLE_CATEGORY_COLORS,
  ARTICLE_CATEGORY_LABELS,
  ARTICLE_STATUS_COLORS,
  ARTICLE_STATUS_LABELS,
  GAZETTE_CATEGORY_OPTIONS,
  IMMO_CATEGORY_OPTIONS,
} from "../../lib/article-labels";
import type { ArticleInput, Merchant } from "../../types";

const STATUSES = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publie" },
  { value: "archived", label: "Archive" },
];

function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

interface AdminArticleFormPageProps {
  editorialScope?: "gazette" | "immo";
}

export function AdminArticleFormPage({ editorialScope }: AdminArticleFormPageProps) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isImmo = editorialScope === "immo" || location.pathname.includes("/admin/immo");
  const isEdit = Boolean(id);

  const categoryOptions = isImmo ? IMMO_CATEGORY_OPTIONS : GAZETTE_CATEGORY_OPTIONS;
  const listPath = isImmo ? "/admin/immo" : "/admin/articles";
  const listLabel = isImmo ? "Articles immo" : "Gazette locale";

  const emptyForm: ArticleInput = useMemo(
    () => ({
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      category: isImmo ? "real_estate" : "local_news",
      status: "draft",
      published_at: "",
      merchant_id: null,
      place_id: null,
    }),
    [isImmo]
  );

  const [form, setForm] = useState<ArticleInput>(emptyForm);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isImmo) {
      fetchAdminMerchants({ status: "published" })
        .then(setMerchants)
        .catch(() => {});
    }
  }, [isImmo]);

  useEffect(() => {
    if (!id) {
      setForm(emptyForm);
      return;
    }

    fetchAdminArticle(Number(id))
      .then((article) => {
        setForm({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || "",
          body: article.body || "",
          category: article.category,
          status: article.status || "draft",
          published_at: toDatetimeLocal(article.published_at),
          merchant_id: article.merchant_id ?? article.merchant?.id ?? null,
          place_id: article.place_id ?? article.place?.id ?? null,
        });
      })
      .catch(() => setError("Article introuvable"))
      .finally(() => setIsLoading(false));
  }, [id, emptyForm]);

  function updateField<K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const linkedMerchant = merchants.find((m) => m.id === form.merchant_id);
  const previewSlug = form.slug?.trim();
  const canPreview = form.status === "published" && previewSlug;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload: ArticleInput = {
      ...form,
      slug: form.slug?.trim() || undefined,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
      merchant_id: isImmo ? null : form.merchant_id || null,
      place_id: form.place_id || null,
    };

    try {
      if (isEdit) {
        await updateAdminArticle(Number(id), payload);
      } else {
        await createAdminArticle(payload);
      }
      navigate(listPath);
    } catch (err: unknown) {
      const errors = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors;
      setError(errors?.join(", ") || "Enregistrement impossible");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <AdminLoading />;
  }

  const heroTitle = isEdit
    ? form.title || "Modifier l'article"
    : isImmo
      ? "Nouvel article immo"
      : "Nouvel article gazette";

  return (
    <section className="space-y-8">
      <AdminEditorialHero
        eyebrow={isImmo ? "Editorial agence" : "Editorial territorial"}
        title={heroTitle}
        description={
          isImmo
            ? "Contenu technique ou editorial agence — publication reservee au back-office."
            : "Portrait commercant ou actu locale — rattachez un territoire pour alimenter la gazette publique."
        }
        icon={
          isImmo ? (
            <IconBuilding className="h-6 w-6 text-white" />
          ) : (
            <IconNewspaper className="h-6 w-6 text-white" />
          )
        }
        backTo={listPath}
        backLabel={listLabel}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AdminFormShell onSubmit={handleSubmit}>
          <AdminFieldset legend="Contenu">
            <AdminFormLabel hint="Titre affiche en une et dans la gazette">
              Titre *
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={`${adminInputClass} mt-1.5`}
                placeholder="Ex. La couronne Martin, une institution depuis 1987"
                required
              />
            </AdminFormLabel>

            <AdminFormLabel hint="Laissez vide pour generer automatiquement depuis le titre">
              Slug URL
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className={`${adminInputClass} mt-1.5 font-mono text-xs`}
                placeholder="couronne-martin-1987"
              />
            </AdminFormLabel>

            <AdminFormLabel hint="Resume visible sur les cartes et en tete d'article">
              Chapeau / extrait
              <input
                type="text"
                value={form.excerpt}
                onChange={(e) => updateField("excerpt", e.target.value)}
                className={`${adminInputClass} mt-1.5`}
                placeholder="Une phrase d'accroche pour donner envie de lire"
              />
            </AdminFormLabel>

            <AdminFormLabel
              hint={
                isImmo
                  ? "Markdown supporte : titres ##, gras **texte**"
                  : "Corps de l'article — paragraphes separes par une ligne vide"
              }
            >
              Corps de l&apos;article
              <textarea
                value={form.body}
                onChange={(e) => updateField("body", e.target.value)}
                className={`${adminInputClass} mt-1.5 font-mono text-sm leading-relaxed`}
                rows={14}
                placeholder="Redigez le contenu de l'article..."
              />
            </AdminFormLabel>
          </AdminFieldset>

          <AdminFieldset legend="Publication">
            <AdminFormLabel>
              Categorie
              <AdminSelect
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="mt-1.5 w-full"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormLabel>

            <AdminFormLabel>
              Statut
              <AdminSelect
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="mt-1.5 w-full"
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormLabel>

            <AdminFormLabel hint="Laissez vide : date du jour si vous publiez sans date">
              Date de publication
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => updateField("published_at", e.target.value)}
                className={`${adminInputClass} mt-1.5`}
              />
            </AdminFormLabel>

            <AdminFormLabel hint="Determine dans quelle gazette territoriale l'article apparait">
              Territoire de publication
              <div className="mt-1.5">
                <PlaceSelect
                  value={form.place_id ?? undefined}
                  onChange={(placeId) => updateField("place_id", placeId ?? null)}
                />
              </div>
            </AdminFormLabel>

            {!isImmo && (
              <AdminFormLabel hint="Lie l'article a un commercant pour le portrait ou la fiche vitrine">
                Commercant associe
                <AdminSelect
                  value={form.merchant_id ?? ""}
                  onChange={(e) =>
                    updateField("merchant_id", e.target.value ? Number(e.target.value) : null)
                  }
                  className="mt-1.5 w-full"
                >
                  <option value="">Aucun commercant lie</option>
                  {merchants.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.name}
                    </option>
                  ))}
                </AdminSelect>
              </AdminFormLabel>
            )}
          </AdminFieldset>

          {error && <AdminAlert>{error}</AdminAlert>}

          <AdminFormActions isSubmitting={isSubmitting} cancelTo={listPath} />
        </AdminFormShell>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <AdminPanelCard title="Statut">
            <div className="space-y-3">
              <AdminBadge className={ARTICLE_STATUS_COLORS[form.status] || "bg-sand text-petrol"}>
                {ARTICLE_STATUS_LABELS[form.status] || form.status}
              </AdminBadge>
              <AdminBadge
                className={
                  ARTICLE_CATEGORY_COLORS[form.category] || "bg-sand text-petrol border-sand-dark/40"
                }
              >
                {ARTICLE_CATEGORY_LABELS[form.category] || form.category}
              </AdminBadge>
              {canPreview && (
                <Link
                  to={`/gazette/${previewSlug}`}
                  target="_blank"
                  className={linkButtonClass("outline", "w-full text-sm")}
                >
                  Previsualiser en ligne
                </Link>
              )}
            </div>
          </AdminPanelCard>

          <AdminPanelCard title="Apercu">
            {form.title ? (
              <article className="space-y-3">
                <h3 className="font-serif text-xl font-semibold leading-snug text-petrol">{form.title}</h3>
                {form.excerpt && (
                  <p className="text-sm leading-relaxed text-ink-muted">{form.excerpt}</p>
                )}
                {form.body && (
                  <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted/90">
                    {form.body}
                  </p>
                )}
              </article>
            ) : (
              <AdminHint>Le titre apparaitra ici des que vous commencerez a rediger.</AdminHint>
            )}
          </AdminPanelCard>

          {!isImmo && linkedMerchant && (
            <AdminPanelCard title="Commercant lie">
              <p className="font-medium text-petrol">{linkedMerchant.name}</p>
              {linkedMerchant.city && (
                <p className="mt-1 text-sm text-ink-muted">{linkedMerchant.city}</p>
              )}
            </AdminPanelCard>
          )}

          <Card className="border-petrol/10 bg-petrol/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brass">Conseil editorial</p>
            <AdminHint>
              {isImmo
                ? "Structurez l'article avec des sous-titres ## pour faciliter la lecture des contenus techniques."
                : "Pour un portrait commercant, commencez par une accroche humaine puis racontez l'histoire du lieu."}
            </AdminHint>
          </Card>
        </aside>
      </div>
    </section>
  );
}
