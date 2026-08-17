// src/api/merchant-publications.ts
import { api } from "./client";
import type { Publication, PublicationInput } from "../types";

export async function fetchMerchantPublications() {
  const { data } = await api.get<Publication[]>("/merchant/publications");
  return data;
}

export async function createMerchantPublication(input: PublicationInput) {
  const form = new FormData();
  form.append("publication[body]", input.body);
  if (input.category) form.append("publication[category]", input.category);
  if (input.image) form.append("publication[image]", input.image);
  if (input.syndicate) form.append("syndicate", "true");
  input.providers?.forEach((provider) => form.append("providers[]", provider));

  const { data } = await api.post<Publication>("/merchant/publications", form);
  return data;
}
