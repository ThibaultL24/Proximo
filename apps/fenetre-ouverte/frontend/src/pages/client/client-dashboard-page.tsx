import { Link } from "react-router-dom";
import { AdminPageHeader } from "../../components/admin/admin-ui";
import { linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../hooks/use-auth";

const citizenPaths = [
  {
    to: "/fil", number: "01", title: "Mon fil local",
    description: "Retrouver les publications, événements et actualités proches de chez moi.",
  },
  {
    to: "/commerces", number: "02", title: "Les commerces",
    description: "Découvrir les artisans, boutiques et partenaires du territoire.",
  },
  {
    to: "/communes", number: "03", title: "Mes communes",
    description: "Parcourir les informations des villages de Fenêtre Ouverte.",
  },
  {
    to: "/gazette", number: "04", title: "La Gazette",
    description: "Consulter les numéros publiés et les portraits de commerçants.",
  },
];

export function ClientDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Fenêtre Ouverte · Mon espace habitant"
        title={`Bienvenue, ${user?.full_name || user?.email || "sur Fenêtre Ouverte"}`}
        description="Accédez au journal, aux commerces et aux actualités du territoire. La consultation reste gratuite."
        backTo=""
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {citizenPaths.map((item) => (
          <Link key={item.number} to={item.to}
            className="rounded-2xl border border-line bg-white p-6 transition hover:border-[#0b4c93] hover:shadow-md">
            <span className="text-xs font-bold tracking-widest text-[#d47e18]">
              DÉCOUVRIR · {item.number}
            </span>
            <h2 className="mt-3 font-serif text-xl font-semibold text-[#0b4c93]">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
          </Link>
        ))}
      </div>

      <Card tone="panel" className="p-6">
        <h2 className="font-serif text-xl font-semibold text-ink">Participer à la vie locale</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Consultez les fiches des commerçants et partagez vos avis lorsque le service est disponible.
          Les publications professionnelles sont modérées avant leur diffusion.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/commerces" className={linkButtonClass("accent")}>
            Découvrir les commerçants
          </Link>
          <Link to="/gazette" className={linkButtonClass("outline")}>
            Lire la Gazette
          </Link>
        </div>
      </Card>
    </section>
  );
}
