// src/pages/admin/admin-merchants-page.tsx
import { useCallback, useEffect, useState } from "react";
import { deleteAdminMerchant, fetchAdminMerchants } from "../../api/admin-merchants";
import { fetchSectors } from "../../api/public";
import {
  AdminActionButton,
  AdminActionLink,
  AdminAlert,
  AdminEmptyState,
  AdminFilters,
  AdminLoading,
  AdminPageHeader,
  AdminPrimaryLink,
  AdminSelect,
  AdminTable,
  AdminTableActions,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "../../components/admin/admin-ui";
import { MERCHANT_STATUS_COLORS, MERCHANT_STATUS_LABELS } from "../../lib/merchant-labels";
import type { Merchant, Sector } from "../../types";

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "draft", label: "Brouillons" },
  { value: "published", label: "Publies" },
  { value: "archived", label: "Archives" },
];

export function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMerchants = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchAdminMerchants({
        status: statusFilter || undefined,
        sector_id: sectorFilter ? Number(sectorFilter) : undefined,
      });
      setMerchants(data);
    } catch {
      setError("Impossible de charger les commercants");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, sectorFilter]);

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => {});
  }, []);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Supprimer "${name}" ? Cette action est irreversible.`)) return;

    setDeletingId(id);
    setError("");
    try {
      await deleteAdminMerchant(id);
      await loadMerchants();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="Reseau"
        title="Commercants"
        description="Gerer les fiches de l'annuaire partenaire, leur localisation et leur visibilite."
        backLabel="Vue d'ensemble"
        action={<AdminPrimaryLink to="/admin/commercants/nouveau">Nouveau commercant</AdminPrimaryLink>}
      />

      <AdminFilters>
        <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </AdminSelect>
        <AdminSelect value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
          <option value="">Tous les secteurs</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>{sector.name}</option>
          ))}
        </AdminSelect>
      </AdminFilters>

      {error && <AdminAlert>{error}</AdminAlert>}
      {isLoading && <AdminLoading />}

      {!isLoading && merchants.length === 0 && (
        <AdminEmptyState>Aucun commercant pour ce filtre.</AdminEmptyState>
      )}

      {merchants.length > 0 && (
        <AdminTable>
          <AdminTableHead>
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Secteur</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Scans QR</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </AdminTableHead>
          <tbody>
            {merchants.map((merchant) => (
              <AdminTableRow key={merchant.id}>
                <AdminTableCell>
                  <p className="font-medium text-petrol">{merchant.name}</p>
                  {merchant.featured && (
                    <span className="mt-1 inline-block text-xs font-medium text-brass">Mis en avant</span>
                  )}
                </AdminTableCell>
                <AdminTableCell className="text-ink-muted">{merchant.sector.name}</AdminTableCell>
                <AdminTableCell className="text-ink-muted">{merchant.city || "—"}</AdminTableCell>
                <AdminTableCell>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${MERCHANT_STATUS_COLORS[merchant.status] || ""}`}>
                    {MERCHANT_STATUS_LABELS[merchant.status] || merchant.status}
                  </span>
                </AdminTableCell>
                <AdminTableCell className="font-medium tabular-nums text-petrol">
                  {merchant.qr_scan_count ?? 0}
                </AdminTableCell>
                <AdminTableCell>
                  <AdminTableActions>
                    <AdminActionLink to={`/admin/commercants/${merchant.id}/modifier`}>Modifier</AdminActionLink>
                    <AdminActionButton
                      disabled={deletingId === merchant.id}
                      onClick={() => handleDelete(merchant.id, merchant.name)}
                    >
                      Supprimer
                    </AdminActionButton>
                  </AdminTableActions>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        </AdminTable>
      )}
    </section>
  );
}
