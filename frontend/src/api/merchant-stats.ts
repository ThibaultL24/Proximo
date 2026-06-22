// src/api/merchant-stats.ts
import { api } from "./client";

export interface MerchantStats {
  merchant_name: string;
  qr_scan_count: number;
  qr_unique_scans: number;
  qr_scans_this_week: number;
  qr_url: string;
  qr_token: string;
}

export async function fetchMerchantStats() {
  const { data } = await api.get<MerchantStats>("/merchant/stats");
  return data;
}
