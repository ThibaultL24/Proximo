// src/pages/merchant/merchant-shop-page.tsx
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  deleteMerchantPhoto,
  fetchMerchantProfile,
  updateMerchantProfile,
} from "../../api/merchant-profile";
import { IconNewspaper } from "../../components/admin/admin-icons";
import { MerchantQrCodeAccess } from "../../components/admin/merchant-qr-code-access";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import {
  AdminActionLink,
  AdminAlert,
  AdminEmptyState,
  AdminFieldset,
  AdminFormShell,
  AdminHint,
  AdminLoading,
  AdminPageHeader,
  adminInputClass,
} from "../../components/admin/admin-ui";
import { buttonClass, linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ARTICLE_CATEGORY_LABELS } from "../../lib/article-labels";
import type { MerchantProfile, MerchantProfileInput } from "../../types";

const emptyForm: MerchantProfileInput = {
  short_description: "",
  description: "",
  address: "",
  postal_code: "",
  city: "",
  phone: "",
  email: "",
  website: "",
};

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MerchantShopPage() {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [form, setForm] = useState<MerchantProfileInput>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  async function loadProfile() {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchMerchantProfile();
      setProfile(data);
      setForm({
        short_description: data.short_description || "",
        description: data.description || "",
        address: data.address || "",
        postal_code: data.postal_code || "",
        city: data.city || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
      });
    } catch {
      setError("Impossible de charger votre fiche");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateField<K extends keyof MerchantProfileInput>(key: K, value: MerchantProfileInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const updated = await updateMerchantProfile(form, {
        logo: logoFile,
        photos: newPhotos.length > 0 ? newPhotos : undefined,
      });
      setProfile(updated);
      setLogoFile(null);
      setNewPhotos([]);
      setSuccess("Votre fiche a ete mise a jour.");
    } catch {
      setError("Enregistrement impossible. Verifiez les champs.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePhoto(signedId: string) {
    if (!window.confirm("Supprimer cette photo de la galerie ?")) return;

    setDeletingPhotoId(signedId);
    setError("");
    try {
      await deleteMerchantPhoto(signedId);
      await loadProfile();
    } catch {
      setError("Impossible de supprimer la photo");
    } finally {
      setDeletingPhotoId(null);
    }
  }

  if (isLoading) return <AdminLoading />;
  if (!profile) return <AdminAlert>{error || "Fiche introuvable"}</AdminAlert>;

  const logoPreview = logoFile
    ? URL.createObjectURL(logoFile)
    : profile.logo?.url || profile.logo_url;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Vitrine"
        title="Ma fiche commercant"
        description="Personnalisez la page visible sur le site et via votre QR code en magasin."
        backTo="/espace-commercant"
        backLabel="Tableau de bord"
        action={
          <div className="flex flex-wrap gap-3">
            <MerchantQrCodeAccess
              mode="merchant"
              merchantName={profile.name}
              merchantSlug={profile.slug}
              sectorName={profile.sector?.name}
              city={profile.city}
              logoUrl={logoPreview || undefined}
              qrToken={profile.qr_token}
              qrUrl={profile.qr_url}
              qrScanCount={profile.qr_scan_count}
              isPublished
              buttonVariant="primary"
            />
            <Link to={profile.public_url} target="_blank" className={linkButtonClass("outline")}>
              Voir ma fiche publique
            </Link>
          </div>
        }
      />

      <AdminFormShell onSubmit={handleSubmit}>
        <AdminFieldset legend="Presentation">
          <AdminHint>
            Le nom du commerce est gere par l&apos;agence. Vous pouvez enrichir votre presentation.
          </AdminHint>
          <input
            type="text"
            value={profile.name}
            disabled
            className={`${adminInputClass} bg-paper-dark/50 text-ink-muted`}
          />
          <input
            type="text"
            placeholder="Accroche courte (visible en un coup d'oeil)"
            value={form.short_description}
            onChange={(e) => updateField("short_description", e.target.value)}
            className={adminInputClass}
          />
          <textarea
            placeholder="Presentation complete de votre commerce"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={adminInputClass}
            rows={5}
          />
        </AdminFieldset>

        <AdminFieldset legend="Coordonnees">
          <input
            type="text"
            placeholder="Adresse"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            className={adminInputClass}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Code postal"
              value={form.postal_code}
              onChange={(e) => updateField("postal_code", e.target.value)}
              className={adminInputClass}
            />
            <input
              type="text"
              placeholder="Ville"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className={adminInputClass}
            />
          </div>
          <input
            type="tel"
            placeholder="Telephone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={adminInputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={adminInputClass}
          />
          <input
            type="url"
            placeholder="Site web"
            value={form.website}
            onChange={(e) => updateField("website", e.target.value)}
            className={adminInputClass}
          />
        </AdminFieldset>

        <AdminFieldset legend="Logo & galerie photos">
          <AdminHint>Ces images apparaissent sur votre fiche publique et la page scannee via QR code.</AdminHint>

          {logoPreview && (
            <div className="flex items-center gap-4">
              <img src={logoPreview} alt="Logo" className="h-20 w-20 rounded-xl border object-cover" />
              <p className="text-sm text-ink-muted">Logo actuel</p>
            </div>
          )}
          <label className="block text-sm font-medium text-petrol">
            Changer le logo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
          </label>

          {profile.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {profile.photos.map((photo) => (
                <div key={photo.signed_id} className="group relative">
                  <img
                    src={photo.url}
                    alt=""
                    className="aspect-[4/3] w-full rounded-xl border border-sand-dark/50 object-cover"
                  />
                  <button
                    type="button"
                    disabled={deletingPhotoId === photo.signed_id}
                    onClick={() => handleDeletePhoto(photo.signed_id)}
                    className="absolute right-2 top-2 rounded-lg bg-alert/90 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="block text-sm font-medium text-petrol">
            Ajouter des photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewPhotos(Array.from(e.target.files ?? []))}
              className="mt-1 block w-full text-sm"
            />
          </label>
          {newPhotos.length > 0 && (
            <AdminHint>{newPhotos.length} photo(s) pretes a etre ajoutees.</AdminHint>
          )}
        </AdminFieldset>

        {error && <AdminAlert>{error}</AdminAlert>}
        {success && (
          <Card className="border-success/30 bg-success/5 p-4 text-sm text-success">{success}</Card>
        )}

        <div className="border-t border-sand-dark/40 pt-5">
          <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer ma fiche"}
          </button>
        </div>
      </AdminFormShell>

      <AdminPanelCard
        title="Articles gazette"
        icon={<IconNewspaper className="h-4 w-4" />}
      >
        <AdminHint>
          Articles publies sur votre etablissement. Contactez l&apos;agence pour en ajouter ou modifier.
        </AdminHint>

        {profile.articles.length === 0 ? (
          <AdminEmptyState>Aucun article pour le moment.</AdminEmptyState>
        ) : (
          <ul className="mt-4 space-y-3">
            {profile.articles.map((article) => (
              <li key={article.id} className="rounded-xl border border-sand-dark/50 bg-paper/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brass">
                      {ARTICLE_CATEGORY_LABELS[article.category] || article.category}
                    </p>
                    <AdminActionLink to={`/gazette/${article.slug}`} target="_blank">
                      <span className="font-serif text-lg font-semibold">{article.title}</span>
                    </AdminActionLink>
                    {article.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{article.excerpt}</p>
                    )}
                  </div>
                  {article.published_at && (
                    <span className="text-xs text-ink-muted">{formatDate(article.published_at)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanelCard>
    </section>
  );
}
