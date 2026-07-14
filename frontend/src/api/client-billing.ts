// src/api/client-billing.ts
import { api } from "./client";
import type { ClientSubscriptionStatus } from "../types";

export async function fetchClientSubscription() {
  const { data } = await api.get<ClientSubscriptionStatus>("/client/billing");
  return data;
}

export async function createClientSubscriptionCheckout() {
  const { data } = await api.post<{ url: string }>("/client/billing");
  return data.url;
}

export async function openClientBillingPortal() {
  const { data } = await api.get<{ url: string }>("/client/billing/portal");
  return data.url;
}
