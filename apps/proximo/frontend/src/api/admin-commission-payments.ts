// src/api/admin-commission-payments.ts
import { api } from "./client";

export async function createCommissionCheckout(commissionId: number) {
  const { data } = await api.post<{ url: string }>(`/admin/commissions/${commissionId}/checkout`);
  return data.url;
}
