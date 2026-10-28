// src/api/reviews.ts
import { api } from "./client";
import type { Review, ReviewInput, ReviewReplyInput } from "../types";

export async function fetchReviews(params: {
  reviewable_type: "Merchant" | "Article" | "Publication";
  reviewable_slug?: string;
  reviewable_id?: number;
}) {
  const { data } = await api.get<Review[]>("/public/reviews", { params });
  return data;
}

export async function createReview(review: ReviewInput) {
  const { data } = await api.post<Review>("/reviews", { review });
  return data;
}

export async function replyToReview(reviewId: number, reply: ReviewReplyInput) {
  const { data } = await api.post<Review>(`/reviews/${reviewId}/reply`, { reply });
  return data;
}

export async function hideReview(reviewId: number, hidden: boolean) {
  const { data } = await api.patch<Review>(`/admin/reviews/${reviewId}`, { hidden });
  return data;
}

export async function fetchPublication(id: number) {
  const { data } = await api.get<import("../types").PublicationDetail>(`/public/publications/${id}`);
  return data;
}
