// src/components/admin/merchant-branded-qr-panel.tsx
import { useEffect, useState } from "react";
import { fetchAdminMerchantQrBlob } from "../../api/admin-merchants";
import { fetchMerchantQrBlob } from "../../api/merchant-qr";
import { publicQrImageUrl } from "../../api/public";
import { AdminHint } from "./admin-ui";
import { linkButtonClass } from "../ui/button";
import { Card } from "../ui/card";

interface MerchantBrandedQrPanelProps {
  mode: "admin" | "merchant";
  merchantId?: number;
  merchantName: string;
  merchantSlug: string;
  sectorName?: string;
  city?: string;
  logoUrl?: string;
  qrToken: string;
  qrUrl: string;
  qrScanCount: number;
  isPublished: boolean;
  embedded?: boolean;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function MerchantBrandedQrPanel({
  mode,
  merchantId,
  merchantName,
  merchantSlug,
  sectorName,
  city,
  logoUrl,
  qrToken,
  qrUrl,
  qrScanCount,
  isPublished,
  embedded = false,
}: MerchantBrandedQrPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<"png" | "pdf" | null>(null);
  const [error, setError] = useState("");

  const subtitle = [sectorName, city].filter(Boolean).join(" · ");
  const filenameBase = `qr-${merchantSlug || qrToken}`;

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadPreview() {
      setError("");
      try {
        if (mode === "merchant") {
          const blob = await fetchMerchantQrBlob("png");
          objectUrl = URL.createObjectURL(blob);
          if (!cancelled) setPreviewUrl(objectUrl);
          return;
        }

        if (merchantId) {
          const blob = await fetchAdminMerchantQrBlob(merchantId, "png");
          objectUrl = URL.createObjectURL(blob);
          if (!cancelled) setPreviewUrl(objectUrl);
          return;
        }

        if (isPublished) {
          if (!cancelled) setPreviewUrl(publicQrImageUrl(qrToken));
        }
      } catch {
        if (!cancelled) {
          setError("Impossible de charger l'apercu du QR code");
          setPreviewUrl(null);
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isPublished, merchantId, mode, qrToken]);

  async function handleDownload(format: "png" | "pdf") {
    setIsDownloading(format);
    setError("");
    try {
      const blob =
        mode === "admin" && merchantId
          ? await fetchAdminMerchantQrBlob(merchantId, format)
          : await fetchMerchantQrBlob(format);
      triggerDownload(blob, `${filenameBase}.${format}`);
    } catch {
      setError(`Telechargement ${format.toUpperCase()} impossible`);
    } finally {
      setIsDownloading(null);
    }
  }

  return (
    <Card className={`overflow-hidden p-0 ${embedded ? "rounded-none border-0 shadow-none" : ""}`}>
      {!embedded && (
        <div className="border-b border-sand-dark/40 bg-paper/40 px-6 py-4">
          <h2 className="font-serif text-lg font-semibold text-petrol">QR code vitrine</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Les visiteurs en magasin scannent ce code pour acceder a la fiche du commerce dans Proxi Immo.
          </p>
        </div>
      )}

      <div className="grid gap-6 p-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="mx-auto w-full max-w-[280px]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`QR code ${merchantName}`}
              className="w-full rounded-xl border border-sand-dark/50 bg-white shadow-sm"
            />
          ) : (
            <div className="flex aspect-[620/874] items-center justify-center rounded-xl border border-dashed border-sand-dark bg-surface text-xs text-ink-muted">
              {error || "Chargement..."}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-petrol/10 bg-petrol/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-petrol/70">Commercant</p>
            <p className="mt-1 font-serif text-xl font-semibold text-petrol">{merchantName}</p>
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
            {logoUrl && (
              <img src={logoUrl} alt="" className="mt-3 h-12 w-12 rounded-lg border object-cover" />
            )}
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="font-medium text-petrol">Scans :</dt>
              <dd className="font-serif text-lg font-semibold tabular-nums text-petrol">{qrScanCount}</dd>
            </div>
            <div>
              <dt className="font-medium text-petrol">Lien :</dt>
              <dd className="mt-1 break-all text-ink-muted">
                <a href={qrUrl} target="_blank" rel="noreferrer" className="text-brass hover:text-petrol">
                  {qrUrl}
                </a>
              </dd>
            </div>
          </dl>

          {!isPublished && mode === "admin" && (
            <AdminHint>Publiez le commercant pour activer le scan public en vitrine.</AdminHint>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isDownloading !== null}
              onClick={() => handleDownload("png")}
              className={linkButtonClass("primary", "text-sm")}
            >
              {isDownloading === "png" ? "Export..." : "Telecharger PNG"}
            </button>
            <button
              type="button"
              disabled={isDownloading !== null}
              onClick={() => handleDownload("pdf")}
              className={linkButtonClass("outline", "text-sm")}
            >
              {isDownloading === "pdf" ? "Export..." : "Telecharger PDF"}
            </button>
          </div>

          <AdminHint>
            A afficher en caisse ou en vitrine : le client arrive directement sur votre fiche dans l&apos;application.
          </AdminHint>
          {error && previewUrl && <p className="text-sm text-alert">{error}</p>}
        </div>
      </div>
    </Card>
  );
}
