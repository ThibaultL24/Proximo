// src/api/platform-integrations.ts
import { api } from "./client";

export interface PlatformIntegrationForm {
  frontend_url: string;
  backend_url: string;
  meta_app_id: string;
  meta_redirect_uri: string;
  meta_login_config_id: string;
  tiktok_client_key: string;
  tiktok_redirect_uri: string;
}

export interface PlatformIntegrationStatus {
  label: string;
  configured: boolean;
  mode: "oauth" | "demo";
  app_id?: string | null;
  secret_configured: boolean;
  secret_source: "database" | "env" | "none";
  redirect_uri: string;
}

export interface PlatformIntegrations {
  frontend_url: string;
  backend_url?: string | null;
  meta_app_id?: string | null;
  meta_app_secret_configured: boolean;
  meta_app_secret_source: "database" | "env" | "none";
  meta_redirect_uri: string;
  meta_login_config_id?: string | null;
  tiktok_client_key?: string | null;
  tiktok_client_secret_configured: boolean;
  tiktok_client_secret_source: "database" | "env" | "none";
  tiktok_redirect_uri: string;
  form: PlatformIntegrationForm;
  meta: PlatformIntegrationStatus;
  tiktok: PlatformIntegrationStatus;
  providers: string[];
  demo_mode: boolean;
}

export interface PlatformIntegrationInput extends PlatformIntegrationForm {
  meta_app_secret?: string;
  tiktok_client_secret?: string;
}

export async function fetchPlatformIntegrations() {
  const { data } = await api.get<PlatformIntegrations>("/platform/integrations");
  return data;
}

export async function updatePlatformIntegrations(integration: PlatformIntegrationInput) {
  const { data } = await api.patch<PlatformIntegrations>("/platform/integrations", { integration });
  return data;
}
