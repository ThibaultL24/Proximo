// src/api/platform-stats.ts
import { api } from "./client";
import type { PlatformStats } from "../types";

export async function fetchPlatformStats() {
  const { data } = await api.get<PlatformStats>("/platform/stats");
  return data;
}
