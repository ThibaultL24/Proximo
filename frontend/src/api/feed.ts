// src/api/feed.ts
import { api } from "./client";
import type { FeedItem } from "../types";

export async function fetchFeed(params?: { category?: string; place_path?: string; limit?: number }) {
  const { data } = await api.get<FeedItem[]>("/public/feed", { params });
  return data;
}
