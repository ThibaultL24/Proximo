// src/api/products.ts
import { api } from "./client";
import type { Product } from "../types";

export async function fetchProducts() {
  const { data } = await api.get<Product[]>("/public/products");
  return data;
}

export async function fetchProduct(slug: string) {
  const { data } = await api.get<Product>(`/public/products/${slug}`);
  return data;
}

export async function createProductCheckout(slug: string) {
  const { data } = await api.post<{ url: string }>(`/public/products/${slug}/checkout`);
  return data.url;
}
