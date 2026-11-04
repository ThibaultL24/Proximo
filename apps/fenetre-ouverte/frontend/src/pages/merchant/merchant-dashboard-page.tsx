import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMerchantStats } from "../../api/merchant-stats";
import { IconQr } from "../../components/admin/admin-icons";
import { MerchantSubscriptionCard } from "../../components/merchant/merchant-subscription-card";
import { AdminStatCard } from "../../components/admin/admin-stat-card";
import {
  AdminAlert, AdminLoading, AdminPageHeader, AdminPrimaryLink,
} from "../../components/admin/admin-ui";
import { useAuth } from "../../hooks/use-auth";

export function MerchantDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<{
    qr_scan_count: number;
    qr_unique_scans: number;
    qr_scans_this_week: number;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMerchantStats()
      .then(stats => setMetrics({
        qr_scan_count: stats.qr_scan_count,
        qr_unique_scans: stats.qr_unique_scans,
        qr_scans_this_week: stats.qr_scans_this_week,
      }))
      .catch(() => setError("Impossible de charger vos statistiques QR."));
  }, []);

  return <section className="space-y-8">
    <AdminPageHeader
      eyebrow="FENÊTRE OUVERTE · ESPACE COMMERÇANT"
      title={`Votre vitrine locale · ${user?.full_name || user?.email}`}
      description="Présentez votre activité, faites connaître vos actualités et suivez la visibilité obtenue grâce à votre QR code."
      backTo=""
      action={<div className="flex flex-wrap gap-3">
        <AdminPrimaryLink to="/espace-commercant/publier">Atelier de diffusion</AdminPrimaryLink>
        <AdminPrimaryLink to="/espace-commercant/ma-fiche">Ma fiche commerçante</AdminPrimaryLink>
      </div>}
    />
    <section className="grid gap-4 md:grid-cols-3" aria-label="Parcours du commerçant">
      {[
        {
          to: "/espace-commercant/ma-fiche", number: "01",
          title: "Ma fiche", body: "Mes coordonnées, mon savoir-faire, ma galerie et ma vitrine publique.",
        },
        {
          to: "/espace-commercant/publier", number: "02",
          title: "Mes publications", body: "Rédiger, choisir les réseaux autorisés et soumettre à Jean-Michel.",
        },
        {
          to: "/espace-commercant", number: "03",
          title: "Ma visibilité", body: "Mesurer les consultations depuis les QR codes imprimés.",
        },
      ].map(item => <Link to={item.to} key={item.number}
        className="rounded-2xl border border-[#dbe5ee] bg-white p-5 shadow-sm transition hover:border-[#0b4c93] hover:shadow-md">
        <span className="text-xs font-extrabold tracking-widest text-[#d47e18]">ÉTAPE {item.number}</span>
        <h2 className="mt-3 text-lg font-extrabold text-[#0b4c93]">{item.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
      </Link>)}
    </section>
    <div className="rounded-2xl bg-[#0b4c93] p-5 text-white">
      <h2 className="text-lg font-bold">Votre visibilité en un regard</h2>
      <p className="mt-1 text-sm text-blue-100">
        Ces chiffres mesurent les scans enregistrés, et non des clients garantis.
      </p>
    </div>
    {error && <AdminAlert>{error}</AdminAlert>}
    {!metrics && !error && <AdminLoading />}
    {metrics && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AdminStatCard label="Scans totaux" value={metrics.qr_scan_count}
        hint="Depuis votre QR code" icon={<IconQr />} accent="brass" />
      <AdminStatCard label="Sessions distinctes" value={metrics.qr_unique_scans}
        hint="Mesure indicative" icon={<IconQr />} accent="petrol" />
      <AdminStatCard label="Cette semaine" value={metrics.qr_scans_this_week}
        hint="Scans sur 7 jours" icon={<IconQr />} accent="success" />
    </div>}
    <details className="rounded-2xl border border-line bg-white p-5">
      <summary className="cursor-pointer font-semibold text-petrol">Mon abonnement (tarifs en cours d'harmonisation)</summary>
      <div className="mt-4"><MerchantSubscriptionCard /></div>
    </details>
  </section>;
}
