// src/api/platform-integrations.ts
import { api } from "./client";

export interface PlatformIntegrationStatus {
  label: string;
  configured: boolean;
  mode: "oauth" | "demo";
  env_keys: string[];
}

export interface PlatformIntegrations {
  frontend_url: string;
  meta: PlatformIntegrationStatus;
  tiktok: PlatformIntegrationStatus;
  providers: string[];
  demo_mode: boolean;
}

export async function fetchPlatformIntegrations() {
  const { data } = await api.get<PlatformIntegrations>("/platform/integrations");
  return data;
}
