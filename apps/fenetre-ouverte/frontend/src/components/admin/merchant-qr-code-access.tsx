// src/components/admin/merchant-qr-code-access.tsx
import { useEffect, useState } from "react";
import { IconQr } from "./admin-icons";
import { MerchantBrandedQrPanel } from "./merchant-branded-qr-panel";
import { linkButtonClass } from "../ui/button";

interface MerchantQrCodeAccessProps {
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
  buttonLabel?: string;
  buttonVariant?: "primary" | "outline" | "ghost" | "accent";
  showIcon?: boolean;
}

export function MerchantQrCodeAccess({
  buttonLabel = "Voir le QR code",
  buttonVariant = "outline",
  showIcon = true,
  ...panelProps
}: MerchantQrCodeAccessProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${linkButtonClass(buttonVariant, "text-sm")} gap-2`}
      >
        {showIcon && <IconQr className="h-4 w-4" />}
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="merchant-qr-dialog-title"
            className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-2xl border border-sand-dark/50 bg-surface shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-sand-dark/40 bg-paper/60 px-5 py-4">
              <div>
                <p id="merchant-qr-dialog-title" className="font-serif text-lg font-semibold text-petrol">
                  QR code vitrine
                </p>
                <p className="text-sm text-ink-muted">Apercu, export PNG et PDF pour impression</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-paper hover:text-petrol"
              >
                Fermer
              </button>
            </div>

            <div className="max-h-[calc(92vh-4.5rem)] overflow-y-auto">
              <MerchantBrandedQrPanel {...panelProps} embedded />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
