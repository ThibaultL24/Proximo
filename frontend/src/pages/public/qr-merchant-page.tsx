// src/pages/public/qr-merchant-page.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchMerchantByQrToken, trackQrScan } from "../../api/public";
import { Card } from "../../components/ui/card";

export function QrMerchantPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("QR code invalide");
      return;
    }

    fetchMerchantByQrToken(token)
      .then((merchant) => {
        const key = `qr-scan-${token}`;
        if (!sessionStorage.getItem(key)) {
          const sessionId = crypto.randomUUID();
          trackQrScan(token, sessionId)
            .then(() => sessionStorage.setItem(key, sessionId))
            .catch(() => {});
        }

        navigate(`/commercants/${merchant.slug}?source=qr`, { replace: true });
      })
      .catch(() => setError("Commercant introuvable ou non publie"));
  }, [navigate, token]);

  if (error) {
    return (
      <Card className="text-center">
        <p className="text-alert">{error}</p>
        <Link to="/annuaire" className="mt-4 inline-block text-sm font-medium text-petrol">
          Voir l&apos;annuaire
        </Link>
      </Card>
    );
  }

  return <p className="text-ink-muted">Ouverture de la fiche commercant...</p>;
}
