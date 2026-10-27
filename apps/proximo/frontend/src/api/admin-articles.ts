// src/api/admin-articles.ts
import { api } from "./client";
import type { Article, ArticleInput } from "../types";

export async function fetchAdminArticles(params?: { status?: string; category?: string; scope?: string }) {
  const { data } = await api.get<Article[]>("/admin/articles", { params });
  return data;
}

export async function fetchAdminArticle(id: number) {
  const { data } = await api.get<Article>(`/admin/articles/${id}`);
  return data;
}

export async function createAdminArticle(article: ArticleInput) {
  const { data } = await api.post<Article>("/admin/articles", { article });
  return data;
}

export async function updateAdminArticle(id: number, article: ArticleInput) {
  const { data } = await api.put<Article>(`/admin/articles/${id}`, { article });
  return data;
}

export async function deleteAdminArticle(id: number) {
  await api.delete(`/admin/articles/${id}`);
}
