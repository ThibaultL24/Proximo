// src/pages/admin/admin-merchant-form-page.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAdminMerchant,
  fetchAdminMerchant,
  updateAdminMerchant,
} from "../../api/admin-merchants";
import { MerchantQrCodeAccess } from "../../components/admin/merchant-qr-code-access";
import { PlaceSelect } from "../../components/admin/place-select";
import {
  AdminAlert,
  AdminFieldset,
  AdminFormActions,
  AdminFormShell,
  AdminHint,
  AdminLoading,
  AdminPageHeader,
  AdminSelect,
  adminInputClass,
} from "../../components/admin/admin-ui";
import { fetchSectors } from "../../api/public";
import type { MerchantInput, Sector } from "../../types";

const STATUSES = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publie" },
  { value: "archived", label: "Archive" },
];

const emptyForm: MerchantInput = {
  name: "",
  slug: "",
  sector_id: 0,
  place_id: undefined,
  short_description: "",
  description: "",
  address: "",
  postal_code: "",
  city: "",
  phone: "",
  email: "",
  website: "",
  status: "draft",
  featured: false,
};

export function AdminMerchantFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<MerchantInput>(emptyForm);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photosFiles, setPhotosFiles] = useState<File[]>([]);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [qrMeta, setQrMeta] = useState<{ token: string; url: string; status: string; scanCount: number } | null>(null);

  useEffect(() => {
    fetchSectors()
      .then((data) => {
        setSectors(data);
        if (!isEdit && data.length > 0) {
          setForm((prev) => ({ ...prev, sector_id: data[0].id }));
        }
      })
      .catch(() => setError("Impossible de charger les secteurs"));
  }, [isEdit]);

  useEffect(() => {
    if (!id) return;

    fetchAdminMerchant(Number(id))
      .then((merchant) => {
        setForm({
          name: merchant.name,
          slug: merchant.slug,
          sector_id: merchant.sector_id ?? merchant.sector.id,
          place_id: merchant.place_id ?? merchant.place?.id,
          short_description: merchant.short_description || "",
          description: merchant.description || "",
          address: merchant.address || "",
          postal_code: merchant.postal_code || "",
          city: merchant.city || "",
          phone: merchant.phone || "",
          email: merchant.email || "",
          website: merchant.website || "",
          status: merchant.status,
          featured: merchant.featured,
        });
        if (merchant.qr_token && merchant.qr_url) {
          setQrMeta({
            token: merchant.qr_token,
            url: merchant.qr_url,
            status: merchant.status,
            scanCount: merchant.qr_scan_count ?? 0,
          });
        }
        setExistingLogoUrl(merchant.logo_url ?? null);
        setExistingPhotoUrls(merchant.photo_urls ?? []);
      })
      .catch(() => setError("Commercant introuvable"))
      .finally(() => setIsLoading(false));
  }, [id]);

  function updateField<K extends keyof MerchantInput>(key: K, value: MerchantInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload: MerchantInput = {
      ...form,
      slug: form.slug?.trim() || undefined,
    };

    try {
      const files = {
        logo: logoFile,
        photos: photosFiles.length > 0 ? photosFiles : undefined,
      };

      if (isEdit) {
        const updated = await updateAdminMerchant(Number(id), payload, files);
        if (updated.qr_token && updated.qr_url) {
          setQrMeta({
            token: updated.qr_token,
            url: updated.qr_url,
            status: updated.status,
            scanCount: updated.qr_scan_count ?? 0,
          });
        }
        setExistingLogoUrl(updated.logo_url ?? null);
        setExistingPhotoUrls(updated.photo_urls ?? []);
        setLogoFile(null);
        setPhotosFiles([]);
      } else {
        const created = await createAdminMerchant(payload, files);
        navigate(`/admin/commercants/${created.id}/modifier`);
      }
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

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        eyebrow="Reseau"
        title={isEdit ? "Modifier le commercant" : "Nouveau commercant"}
        description="Fiche annuaire, localisation territoriale, medias et QR code partenaire."
        backTo="/admin/commercants"
        backLabel="Commercants"
        action={
          isEdit && id && qrMeta ? (
            <MerchantQrCodeAccess
              mode="admin"
              merchantId={Number(id)}
              merchantName={form.name}
              merchantSlug={form.slug || qrMeta.token}
              sectorName={sectors.find((sector) => sector.id === form.sector_id)?.name}
              city={form.city}
              logoUrl={existingLogoUrl || undefined}
              qrToken={qrMeta.token}
              qrUrl={qrMeta.url}
              qrScanCount={qrMeta.scanCount}
              isPublished={qrMeta.status === "published"}
              buttonVariant="primary"
            />
          ) : undefined
        }
      />

      <AdminFormShell onSubmit={handleSubmit}>
        <AdminFieldset legend="Informations generales">
          <input
            type="text"
            placeholder="Nom du commerce *"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={adminInputClass}
            required
          />
          <input
            type="text"
            placeholder="Slug URL (auto si vide)"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className={adminInputClass}
          />
          <AdminSelect
            value={form.sector_id}
            onChange={(e) => updateField("sector_id", Number(e.target.value))}
            className="w-full"
            required
          >
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>{sector.name} — {sector.city}</option>
            ))}
          </AdminSelect>
          <AdminSelect
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full"
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </AdminSelect>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              className="rounded border-sand-dark text-petrol focus:ring-petrol/20"
            />
            Mettre en avant sur l&apos;annuaire
          </label>
        </AdminFieldset>

        <AdminFieldset legend="Presentation">
          <input
            type="text"
            placeholder="Description courte"
            value={form.short_description}
            onChange={(e) => updateField("short_description", e.target.value)}
            className={adminInputClass}
          />
          <textarea
            placeholder="Description complete"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={adminInputClass}
            rows={4}
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

        <AdminFieldset legend="Localisation (France)">
          <PlaceSelect
            value={form.place_id}
            onChange={(placeId) => updateField("place_id", placeId)}
          />
          <AdminHint>Selectionnez au minimum un departement. Ville et quartier si disponibles.</AdminHint>
        </AdminFieldset>

        <AdminFieldset legend="Images">
          {(existingLogoUrl || logoFile) && (
            <div className="flex items-center gap-3 rounded-xl border border-sand-dark/40 bg-surface p-3">
              <img
                src={logoFile ? URL.createObjectURL(logoFile) : existingLogoUrl!}
                alt="Logo"
                className="h-16 w-16 rounded-lg border object-cover"
              />
              <p className="text-sm text-ink-muted">Logo actuel</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-petrol file:px-3 file:py-2 file:text-sm file:text-white"
          />
          {existingPhotoUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {existingPhotoUrls.map((url) => (
                <img key={url} src={url} alt="" className="h-20 w-20 rounded-xl border object-cover" />
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotosFiles(Array.from(e.target.files ?? []))}
            className="w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-petrol file:px-3 file:py-2 file:text-sm file:text-white"
          />
          <AdminHint>Les nouvelles photos s&apos;ajoutent aux existantes.</AdminHint>
        </AdminFieldset>

        {error && <AdminAlert>{error}</AdminAlert>}

        <AdminFormActions isSubmitting={isSubmitting} cancelTo="/admin/commercants" />
      </AdminFormShell>
    </section>
  );
}
