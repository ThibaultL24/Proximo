// src/api/merchant-billing.ts
import { api } from "./client";
import type { MerchantSubscriptionStatus } from "../types";

export async function fetchMerchantSubscription() {
  const { data } = await api.get<MerchantSubscriptionStatus>("/merchant/billing");
  return data;
}

export async function createMerchantSubscriptionCheckout() {
  const { data } = await api.post<{ url: string }>("/merchant/billing");
  return data.url;
}

export async function openMerchantBillingPortal() {
  const { data } = await api.get<{ url: string }>("/merchant/billing/portal");
  return data.url;
}
