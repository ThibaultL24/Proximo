import { api } from "./client";

export type DistributionMode = "oauth" | "planned" | "partner" | "paid";
export interface DistributionChannel {
  id: string;
  label: string;
  mode: DistributionMode;
  scope: string;
  notes: string;
  configured: boolean;
  connected_live: boolean;
  demo: boolean;
}

export async function fetchDistributionChannels(): Promise<DistributionChannel[]> {
  const { data } = await api.get<DistributionChannel[]>("/merchant/social_channels");
  return data;
}
