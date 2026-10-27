// src/pages/platform/platform-integrations-page.tsx
import { useEffect, useState } from "react";
import {
  fetchPlatformIntegrations,
  updatePlatformIntegrations,
  type PlatformIntegrationInput,
  type PlatformIntegrations,
} from "../../api/platform-integrations";
import {
  AdminAlert,
  AdminFieldset,
  AdminHint,
  AdminLoading,
  AdminPageHeader,
  adminInputClass,
} from "../../components/admin/admin-ui";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import { Badge } from "../../components/ui/badge";
import { linkButtonClass } from "../../components/ui/button";

const emptyForm: PlatformIntegrationInput = {
  frontend_url: "",
  backend_url: "",
  meta_app_id: "",
  meta_redirect_uri: "",
  meta_login_config_id: "",
  meta_app_secret: "",
  tiktok_client_key: "",
  tiktok_redirect_uri: "",
  tiktok_client_secret: "",
};

function sourceLabel(source: string) {
  if (source === "database") return "Enregistre (chiffre)";
  if (source === "env") return "Via .env";
  return "Non renseigne";
}

export function PlatformIntegrationsPage() {
  const [data, setData] = useState<PlatformIntegrations | null>(null);
  const [form, setForm] = useState<PlatformIntegrationInput>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    const response = await fetchPlatformIntegrations();
    setData(response);
    setForm({
      ...emptyForm,
      ...response.form,
      meta_app_secret: "",
      tiktok_client_secret: "",
    });
  }

  useEffect(() => {
    load()
      .catch(() => setError("Impossible de charger les integrations"))
      .finally(() => setIsLoading(false));
  }, []);

  function updateField<K extends keyof PlatformIntegrationInput>(key: K, value: PlatformIntegrationInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const payload: PlatformIntegrationInput = { ...form };
      if (!payload.meta_app_secret) delete payload.meta_app_secret;
      if (!payload.tiktok_client_secret) delete payload.tiktok_client_secret;

      const response = await updatePlatformIntegrations(payload);
      setData(response);
      setForm({
        ...emptyForm,
        ...response.form,
        meta_app_secret: "",
        tiktok_client_secret: "",
      });
      setMessage("Parametres enregistres. Les secrets ne sont jamais reaffichés.");
    } catch {
      setError("Enregistrement impossible. Verifiez les champs.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <AdminLoading />;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Super admin"
        title="Integrations reseaux"
        description="Configurez l'app Meta et TikTok de la plateforme. Les secrets sont chiffres en base et jamais reaffichés."
        backTo="/plateforme"
      />

      {message && (
        <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          {message}
        </div>
      )}
      {error && <AdminAlert>{error}</AdminAlert>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminPanelCard title="Mode effectif">
              {data.demo_mode ? (
                <Badge variant="soon">Demo — OAuth indisponible</Badge>
              ) : (
                <Badge variant="featured">OAuth live disponible</Badge>
              )}
              <p className="mt-3 text-sm text-ink-muted">
                Reseaux V1 : {data.providers.join(", ")}. Les commercants renseignent leurs pages puis connectent
                via OAuth.
              </p>
            </AdminPanelCard>
            <AdminPanelCard title="URL publique effective">
              <p className="font-mono text-sm text-ink">{data.frontend_url}</p>
              <p className="mt-2 text-xs text-ink-muted">Utilisee pour les QR codes et les retours OAuth.</p>
            </AdminPanelCard>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AdminPanelCard title="URLs plateforme">
              <AdminFieldset legend="URLs publiques">
                <AdminHint>Laissez vide pour conserver les valeurs .env ou les defauts dev/demo.</AdminHint>
                <input
                  type="url"
                  placeholder="https://demo.fenetreouverte.fr"
                  value={form.frontend_url}
                  onChange={(e) => updateField("frontend_url", e.target.value)}
                  className={adminInputClass}
                />
                <input
                  type="url"
                  placeholder="https://api.demo.fenetreouverte.fr (optionnel)"
                  value={form.backend_url}
                  onChange={(e) => updateField("backend_url", e.target.value)}
                  className={adminInputClass}
                />
              </AdminFieldset>
            </AdminPanelCard>

            <AdminPanelCard title="Meta — Facebook / Instagram">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant={data.meta.configured ? "featured" : "soon"}>
                  {data.meta.configured ? "OAuth pret" : "Demo"}
                </Badge>
                <span className="text-xs text-ink-muted">
                  Secret : {data.meta.secret_configured ? "oui" : "non"} ({sourceLabel(data.meta.secret_source)})
                </span>
              </div>
              <AdminFieldset legend="App Meta">
                <input
                  type="text"
                  placeholder="App ID Meta"
                  value={form.meta_app_id}
                  onChange={(e) => updateField("meta_app_id", e.target.value)}
                  className={adminInputClass}
                />
                <input
                  type="password"
                  placeholder={
                    data.meta_app_secret_configured
                      ? "App Secret (laisser vide pour conserver)"
                      : "App Secret Meta"
                  }
                  value={form.meta_app_secret}
                  onChange={(e) => updateField("meta_app_secret", e.target.value)}
                  className={adminInputClass}
                  autoComplete="new-password"
                />
                <input
                  type="url"
                  placeholder="Redirect URI (optionnel)"
                  value={form.meta_redirect_uri}
                  onChange={(e) => updateField("meta_redirect_uri", e.target.value)}
                  className={adminInputClass}
                />
                <p className="text-xs text-ink-muted">Defaut : {data.meta_redirect_uri}</p>
                <input
                  type="text"
                  placeholder="Login Config ID (optionnel, Facebook Login for Business)"
                  value={form.meta_login_config_id}
                  onChange={(e) => updateField("meta_login_config_id", e.target.value)}
                  className={adminInputClass}
                />
              </AdminFieldset>
            </AdminPanelCard>

            <AdminPanelCard title="TikTok">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant={data.tiktok.configured ? "featured" : "soon"}>
                  {data.tiktok.configured ? "OAuth pret" : "Demo"}
                </Badge>
                <span className="text-xs text-ink-muted">
                  Secret : {data.tiktok.secret_configured ? "oui" : "non"} ({sourceLabel(data.tiktok.secret_source)})
                </span>
              </div>
              <AdminHint>
                Client Key + Secret : le bouton Connecter du commerçant ouvre OAuth TikTok. La publication live
                envoie une photo HTTPS (Direct Post). Sans audit TikTok, l&apos;API peut encore refuser le post
                public — le fil Fenêtre Ouverte et les autres réseaux continuent.
              </AdminHint>
              <AdminFieldset legend="App TikTok">
                <input
                  type="text"
                  placeholder="Client Key TikTok"
                  value={form.tiktok_client_key}
                  onChange={(e) => updateField("tiktok_client_key", e.target.value)}
                  className={adminInputClass}
                />
                <input
                  type="password"
                  placeholder={
                    data.tiktok_client_secret_configured
                      ? "Client Secret (laisser vide pour conserver)"
                      : "Client Secret TikTok"
                  }
                  value={form.tiktok_client_secret}
                  onChange={(e) => updateField("tiktok_client_secret", e.target.value)}
                  className={adminInputClass}
                  autoComplete="new-password"
                />
                <input
                  type="url"
                  placeholder="Redirect URI (optionnel)"
                  value={form.tiktok_redirect_uri}
                  onChange={(e) => updateField("tiktok_redirect_uri", e.target.value)}
                  className={adminInputClass}
                />
                <p className="text-xs text-ink-muted">Defaut : {data.tiktok_redirect_uri}</p>
              </AdminFieldset>
            </AdminPanelCard>

            <button type="submit" disabled={isSaving} className={linkButtonClass("accent")}>
              {isSaving ? "Enregistrement..." : "Enregistrer les parametres"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
