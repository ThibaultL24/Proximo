// src/api/merchant-stripe.ts
import { api } from "./client";
import type { StripeConnectStatus } from "../types";

export async function fetchMerchantStripeStatus() {
  const { data } = await api.get<StripeConnectStatus>("/merchant/stripe_connect");
  return data;
}

export async function createMerchantStripeOnboardingLink() {
  const { data } = await api.post<{ url: string }>("/merchant/stripe_connect");
  return data.url;
}

export async function fetchMerchantStripeDashboardLink() {
  const { data } = await api.get<{ url: string }>("/merchant/stripe_connect/dashboard");
  return data.url;
}
