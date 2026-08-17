// src/api/merchant-social.ts
import { api } from "./client";
import type { SocialAccount, SocialProvider } from "../types";

export interface SocialProviderStatus {
  provider: SocialProvider;
  oauth_configured: boolean;
  connected: boolean;
  demo: boolean;
  account_name?: string | null;
  status?: string | null;
}

export interface SocialAccountsResponse {
  providers: SocialProviderStatus[];
  accounts: SocialAccount[];
}

export interface SocialConnectResponse {
  mode: "demo" | "oauth";
  provider: SocialProvider;
  url?: string;
  account?: SocialAccount;
}

export async function fetchSocialAccounts() {
  const { data } = await api.get<SocialAccountsResponse>("/merchant/social_accounts");
  return data;
}

export async function connectSocialProvider(provider: SocialProvider) {
  const { data } = await api.post<SocialConnectResponse>(
    `/merchant/social_accounts/${provider}/connect`
  );
  return data;
}

/** @deprecated Prefer connectSocialProvider */
export async function connectSocialAccount(provider: SocialProvider, accountName: string) {
  const { data } = await api.post<SocialAccount>("/merchant/social_accounts", {
    social_account: { provider, account_name: accountName },
  });
  return data;
}

export async function disconnectSocialAccount(provider: SocialProvider) {
  await api.delete(`/merchant/social_accounts/${provider}`);
}
