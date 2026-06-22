// src/api/admin-merchants.ts
import { api } from "./client";
import type { Merchant, MerchantInput } from "../types";

interface MerchantFiles {
  logo?: File | null;
  photos?: File[];
}

function buildMerchantFormData(merchant: MerchantInput, files?: MerchantFiles) {
  const formData = new FormData();

  formData.append("merchant[name]", merchant.name);
  if (merchant.sector_id) formData.append("merchant[sector_id]", String(merchant.sector_id));
  if (merchant.place_id) formData.append("merchant[place_id]", String(merchant.place_id));
  formData.append("merchant[status]", merchant.status);
  formData.append("merchant[featured]", merchant.featured ? "1" : "0");

  if (merchant.slug?.trim()) formData.append("merchant[slug]", merchant.slug.trim());
  if (merchant.short_description) formData.append("merchant[short_description]", merchant.short_description);
  if (merchant.description) formData.append("merchant[description]", merchant.description);
  if (merchant.address) formData.append("merchant[address]", merchant.address);
  if (merchant.postal_code) formData.append("merchant[postal_code]", merchant.postal_code);
  if (merchant.city) formData.append("merchant[city]", merchant.city);
  if (merchant.phone) formData.append("merchant[phone]", merchant.phone);
  if (merchant.email) formData.append("merchant[email]", merchant.email);
  if (merchant.website) formData.append("merchant[website]", merchant.website);

  if (files?.logo) formData.append("merchant[logo]", files.logo);
  files?.photos?.forEach((photo) => formData.append("merchant[photos][]", photo));

  return formData;
}

export async function fetchAdminMerchants(params?: { status?: string; sector_id?: number }) {
  const { data } = await api.get<Merchant[]>("/admin/merchants", { params });
  return data;
}

export async function fetchAdminMerchant(id: number) {
  const { data } = await api.get<Merchant>(`/admin/merchants/${id}`);
  return data;
}

export async function createAdminMerchant(merchant: MerchantInput, files?: MerchantFiles) {
  const formData = buildMerchantFormData(merchant, files);
  const { data } = await api.post<Merchant>("/admin/merchants", formData);
  return data;
}

export async function updateAdminMerchant(id: number, merchant: MerchantInput, files?: MerchantFiles) {
  const formData = buildMerchantFormData(merchant, files);
  const { data } = await api.put<Merchant>(`/admin/merchants/${id}`, formData);
  return data;
}

export async function deleteAdminMerchant(id: number) {
  await api.delete(`/admin/merchants/${id}`);
}

export async function fetchAdminMerchantQrBlob(id: number, format: "png" | "pdf" = "png") {
  const { data } = await api.get<Blob>(`/admin/merchants/${id}/qr.${format}`, {
    responseType: "blob",
  });
  return data;
}
