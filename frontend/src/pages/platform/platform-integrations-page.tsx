// src/pages/platform/platform-integrations-page.tsx
import { useEffect, useState } from "react";
import { fetchPlatformIntegrations, type PlatformIntegrations } from "../../api/platform-integrations";
import { AdminAlert, AdminLoading, AdminPageHeader } from "../../components/admin/admin-ui";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import { Badge } from "../../components/ui/badge";

export function PlatformIntegrationsPage() {
  const [data, setData] = useState<PlatformIntegrations | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlatformIntegrations()
      .then(setData)
      .catch(() => setError("Impossible de charger les integrations"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <AdminLoading />;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Super admin"
        title="Integrations reseaux"
        description="Statut des apps Meta et TikTok pour la syndication commercant. Les secrets restent cote serveur (.env)."
        backTo="/plateforme"
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminPanelCard title="URL publique (QR / retours OAuth)">
            <p className="font-mono text-sm text-ink">{data.frontend_url}</p>
            <p className="mt-3 text-sm text-ink-muted">
              Variable <code className="rounded bg-paper px-1">FRONTEND_URL</code>. En dev sans variable, localhost ;
              en demo deployee, URL publique par defaut.
            </p>
          </AdminPanelCard>

          <AdminPanelCard title="Mode plateforme">
            {data.demo_mode ? (
              <Badge variant="soon">Demo — cles app absentes</Badge>
            ) : (
              <Badge variant="featured">OAuth live disponible</Badge>
            )}
            <p className="mt-3 text-sm text-ink-muted">
              Reseaux V1 : {data.providers.join(", ")}. Les commercants renseignent leurs pages puis connectent via
              OAuth ; sans cles, connexion demo explicite.
            </p>
          </AdminPanelCard>

          {[data.meta, data.tiktok].map((integration) => (
            <AdminPanelCard key={integration.label} title={integration.label}>
              <div className="flex items-center gap-2">
                <Badge variant={integration.configured ? "featured" : "soon"}>
                  {integration.configured ? "Configure" : "Demo"}
                </Badge>
                <span className="text-sm text-ink-muted">mode {integration.mode}</span>
              </div>
              <p className="mt-3 text-sm text-ink-muted">Variables serveur attendues :</p>
              <ul className="mt-2 space-y-1 font-mono text-xs text-ink">
                {integration.env_keys.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </AdminPanelCard>
          ))}
        </div>
      )}
    </section>
  );
}
