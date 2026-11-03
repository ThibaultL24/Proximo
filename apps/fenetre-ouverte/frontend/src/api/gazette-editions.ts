import { api } from "./client";

export type GazetteTemplate = "portrait" | "pratique" | "reportage" | "couverture" | "agenda" | "photo";
export interface GazettePageData {
  id: number;
  template: GazetteTemplate;
  articleId: number | null;
  rubric: string;
  note: string;
  article_snapshot?: {
    id: number;
    title: string;
    excerpt?: string | null;
    body?: string | null;
    cover_blob_id?: number | null;
    cover_image_url?: string | null;
  };
}
export interface GazetteEditionSettings {
  subtitle: string;
  territory: string;
  banner: string;
  contact: string;
  legal: string;
}
export interface GazetteEditionInput {
  issue_label: string;
  edition_label: string;
  settings: GazetteEditionSettings;
  pages: GazettePageData[];
}
export interface GazetteEditionRecord extends GazetteEditionInput {
  id: number;
  status: "draft" | "published" | "archived";
  lock_version: number;
  published_at: string | null;
  updated_at: string;
  asset_urls: Record<string, string | null>;
}
const ROOT = "/admin/gazette_editions";
export async function listGazetteEditions(): Promise<GazetteEditionRecord[]> {
  const { data } = await api.get<GazetteEditionRecord[]>(ROOT);
  return data;
}
export async function getGazetteEdition(id: number): Promise<GazetteEditionRecord> {
  const { data } = await api.get<GazetteEditionRecord>(ROOT + "/" + id);
  return data;
}
export async function createGazetteEdition(payload: GazetteEditionInput): Promise<GazetteEditionRecord> {
  const { data } = await api.post<GazetteEditionRecord>(ROOT, { gazette_edition: payload });
  return data;
}
export async function updateGazetteEdition(payload: GazetteEditionRecord, body: GazetteEditionInput): Promise<GazetteEditionRecord> {
  const { data } = await api.patch<GazetteEditionRecord>(ROOT + "/" + payload.id, {
    gazette_edition: { ...body, lock_version: payload.lock_version },
  });
  return data;
}
export async function publishGazetteEdition(payload: GazetteEditionRecord): Promise<GazetteEditionRecord> {
  const { data } = await api.patch<GazetteEditionRecord>(ROOT + "/" + payload.id + "/publish", {
    lock_version: payload.lock_version,
  });
  return data;
}
export async function archiveGazetteEdition(payload: GazetteEditionRecord): Promise<GazetteEditionRecord> {
  const { data } = await api.patch<GazetteEditionRecord>(ROOT + "/" + payload.id + "/archive", {
    lock_version: payload.lock_version,
  });
  return data;
}

export async function uploadGazetteEditionAsset(
  edition: GazetteEditionRecord,
  slot: "headerLogo" | "footerLogo" | "extraImage" | "qrImage",
  file: File,
  pageId?: number
): Promise<GazetteEditionRecord> {
  const form = new FormData();
  form.append("slot", slot);
  form.append("file", file);
  form.append("lock_version", String(edition.lock_version));
  if (pageId !== undefined) form.append("page_id", String(pageId));
  const { data } = await api.post<GazetteEditionRecord>(
    ROOT + "/" + edition.id + "/upload_asset", form
  );
  return data;
}
