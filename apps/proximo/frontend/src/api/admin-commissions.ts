// src/api/admin-commissions.ts
import { api } from "./client";
import type { Commission, CommissionInput } from "../types";

export async function fetchAdminCommissions(status?: string) {
  const { data } = await api.get<Commission[]>("/admin/commissions", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function updateAdminCommission(id: number, commission: CommissionInput) {
  const { data } = await api.patch<Commission>(`/admin/commissions/${id}`, { commission });
  return data;
}

export async function exportAdminCommissions(status?: string) {
  const { data } = await api.get<Blob>("/admin/commissions/export", {
    params: status ? { status } : undefined,
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `commissions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
