// src/api/public.ts
import { api } from "./client";
import type { Article, Merchant, Place, PlaceLookup, Sector } from "../types";

export async function fetchPlaces(parentId?: number) {
  const { data } = await api.get<Place[]>("/public/places", {
    params: parentId ? { parent_id: parentId } : undefined,
  });
  return data;
}

export async function lookupPlace(path: string) {
  const { data } = await api.get<PlaceLookup>("/public/places/lookup", {
    params: { path },
  });
  return data;
}

export async function fetchSectors() {
  const { data } = await api.get<Sector[]>("/public/sectors");
  return data;
}

export async function fetchMerchants(params?: {
  sector_slug?: string;
  place_path?: string;
  featured?: boolean;
}) {
  const { data } = await api.get<Merchant[]>("/public/merchants", { params });
  return data;
}

export async function fetchMerchant(slug: string) {
  const { data } = await api.get<Merchant>(`/public/merchants/${slug}`);
  return data;
}

export async function fetchMerchantByQrToken(token: string) {
  const { data } = await api.get<Merchant>(`/public/qr/${token}`);
  return data;
}

export async function trackQrScan(token: string, sessionId: string) {
  await api.post(`/public/qr/${token}/scan`, { session_id: sessionId });
}

export function publicQrImageUrl(token: string) {
  return `/api/v1/public/qr/${token}/image`;
}

export async function fetchArticles(placePath?: string, scope?: string) {
  const { data } = await api.get<Article[]>("/public/articles", {
    params: {
      ...(placePath ? { place_path: placePath } : {}),
      ...(scope ? { scope } : {}),
    },
  });
  return data;
}

export async function fetchArticle(slug: string) {
  const { data } = await api.get<Article>(`/public/articles/${slug}`);
  return data;
}
