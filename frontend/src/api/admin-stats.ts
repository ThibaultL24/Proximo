// src/api/admin-stats.ts
import { api } from "./client";
import type { AdminStats } from "../types";

export async function fetchAdminStats() {
  const { data } = await api.get<AdminStats>("/admin/stats");
  return data;
}
