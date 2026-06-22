// src/api/merchant-qr.ts
import { api } from "./client";

export async function fetchMerchantQrBlob(format: "png" | "pdf" = "png") {
  const { data } = await api.get<Blob>(`/merchant/qr.${format}`, {
    responseType: "blob",
  });
  return data;
}
