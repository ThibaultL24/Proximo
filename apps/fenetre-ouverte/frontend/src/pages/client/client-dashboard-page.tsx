// src/pages/client/client-dashboard-page.tsx
import { Link } from "react-router-dom";
import { AdminPageHeader } from "../../components/admin/admin-ui";
import { linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../hooks/use-auth";

export function ClientDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Espace citoyen"
        title={`Bonjour, ${user?.full_name || user?.email}`}
        description="Compte gratuit : fil local, commerces et avis."
        backTo=""
      />

      <Card tone="panel" className="p-6">
        <h2 className="font-serif text-xl font-semibold text-ink">Un projet immobilier ?</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          On ne le dépose pas sur le site. Parlez-en à un commerçant partenaire du 07700, en magasin
          : c&apos;est lui qui transmet le contact à l&apos;agence.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/commerces" className={linkButtonClass("accent")}>
            Voir les commerces
          </Link>
          <Link to="/fil" className={linkButtonClass("outline")}>
            Lire le fil
          </Link>
        </div>
      </Card>
    </section>
  );
}
