// src/api/merchant-profile.ts
import { api } from "./client";
import type { MerchantProfile, MerchantProfileInput } from "../types";

function buildProfileFormData(data: MerchantProfileInput, files?: { logo?: File | null; photos?: File[] }) {
  const formData = new FormData();

  if (data.short_description !== undefined) formData.append("merchant[short_description]", data.short_description);
  if (data.description !== undefined) formData.append("merchant[description]", data.description);
  if (data.address !== undefined) formData.append("merchant[address]", data.address);
  if (data.postal_code !== undefined) formData.append("merchant[postal_code]", data.postal_code);
  if (data.city !== undefined) formData.append("merchant[city]", data.city);
  if (data.phone !== undefined) formData.append("merchant[phone]", data.phone);
  if (data.email !== undefined) formData.append("merchant[email]", data.email);
  if (data.website !== undefined) formData.append("merchant[website]", data.website);

  if (files?.logo) formData.append("merchant[logo]", files.logo);
  files?.photos?.forEach((photo) => formData.append("merchant[photos][]", photo));

  return formData;
}

export async function fetchMerchantProfile() {
  const { data } = await api.get<MerchantProfile>("/merchant/profile");
  return data;
}

export async function updateMerchantProfile(
  profile: MerchantProfileInput,
  files?: { logo?: File | null; photos?: File[] }
) {
  const formData = buildProfileFormData(profile, files);
  const { data } = await api.patch<MerchantProfile>("/merchant/profile", formData);
  return data;
}

export async function deleteMerchantPhoto(signedId: string) {
  await api.delete("/merchant/profile/photos", { params: { signed_id: signedId } });
}
