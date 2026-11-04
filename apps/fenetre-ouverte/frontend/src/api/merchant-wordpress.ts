import { api } from "./client";

export interface WordpressConnection {
  connected: boolean;
  site_url: string | null;
  username: string | null;
}

export interface WordpressCredentials {
  site_url: string;
  username: string;
  application_password: string;
  authorized: boolean;
}

/** Les identifiants sont envoyés uniquement au backend Rails par HTTPS.
 * Ils ne sont pas conservés dans le navigateur ou un stockage local. */
export async function fetchWordpressConnection(): Promise<WordpressConnection> {
  const { data } = await api.get<WordpressConnection>("/merchant/wordpress_connection");
  return data;
}

export async function connectWordpress(input: WordpressCredentials): Promise<WordpressConnection> {
  const { data } = await api.post<WordpressConnection>("/merchant/wordpress_connection", { wordpress: input });
  return data;
}

export async function disconnectWordpress(): Promise<void> {
  await api.delete("/merchant/wordpress_connection");
}
