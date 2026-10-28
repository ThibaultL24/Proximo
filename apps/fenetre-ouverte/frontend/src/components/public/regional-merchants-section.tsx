// src/components/public/regional-merchants-section.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMerchants } from "../../api/public";
import { useTerritory } from "../../context/territory-context";
import { linkButtonClass } from "../ui/button";
import { MerchantCard } from "./merchant-card";
import type { Merchant } from "../../types";

interface RegionalMerchantsSectionProps {
  previewLimit?: number;
  annuaireHref?: string;
  showAnnuaireLink?: boolean;
}

export function RegionalMerchantsSection({
  previewLimit = 6,
  annuaireHref = "/annuaire",
  showAnnuaireLink = true,
}: RegionalMerchantsSectionProps) {
  const { territory } = useTerritory();
  const [regionalMerchants, setRegionalMerchants] = useState<Merchant[]>([]);
  const [otherMerchants, setOtherMerchants] = useState<Merchant[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!territory?.regionPath) {
      setRegionalMerchants([]);
      setOtherMerchants([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setShowAll(false);

    Promise.all([
      fetchMerchants({ place_path: territory.regionPath }),
      fetchMerchants(),
    ])
      .then(([regional, all]) => {
        setRegionalMerchants(regional);
        const regionalIds = new Set(regional.map((merchant) => merchant.id));
        setOtherMerchants(all.filter((merchant) => !regionalIds.has(merchant.id)));
      })
      .catch(() => {
        setRegionalMerchants([]);
        setOtherMerchants([]);
      })
      .finally(() => setIsLoading(false));
  }, [territory?.regionPath]);

  if (!territory?.regionPath) return null;

  const visibleMerchants = showAll
    ? [...regionalMerchants, ...otherMerchants]
    : previewLimit
      ? regionalMerchants.slice(0, previewLimit)
      : regionalMerchants;

  const canExpand =
    !showAll &&
    ((previewLimit && regionalMerchants.length > previewLimit) || otherMerchants.length > 0);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brass">Votre region</p>
          <h2 className="font-serif text-2xl font-semibold text-petrol">
            Commercants · {territory.regionName}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Affichage prioritaire selon votre territoire enregistre localement.
          </p>
        </div>
        {showAnnuaireLink && (
          <Link
            to={`/annuaire/${territory.regionPath}`}
            className="text-sm font-medium text-brass hover:text-petrol"
          >
            Toute la region →
          </Link>
        )}
      </div>

      {isLoading && <p className="text-sm text-ink-muted">Chargement...</p>}

      {!isLoading && regionalMerchants.length === 0 && !showAll && otherMerchants.length === 0 && (
        <p className="rounded-2xl border border-dashed border-sand-dark bg-surface/50 px-6 py-10 text-center text-ink-muted">
          Aucun commercant partenaire en {territory.regionName} pour le moment.
        </p>
      )}

      {!isLoading && regionalMerchants.length === 0 && !showAll && otherMerchants.length > 0 && (
        <p className="text-sm text-ink-muted">
          Aucun partenaire en {territory.regionName} pour le moment. Elargissez la recherche au reste de la France.
        </p>
      )}

      {!isLoading && visibleMerchants.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleMerchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      )}

      {!isLoading && canExpand && (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setShowAll(true)} className={linkButtonClass("outline")}>
            Voir plus de commercants
            {otherMerchants.length > 0 && ` (${otherMerchants.length} ailleurs en France)`}
          </button>
          {showAnnuaireLink && (
            <Link to={annuaireHref} className={linkButtonClass("ghost")}>
              Explorer l&apos;annuaire complet
            </Link>
          )}
        </div>
      )}

      {!isLoading && showAll && otherMerchants.length > 0 && (
        <p className="text-sm text-ink-muted">
          {regionalMerchants.length} commercant{regionalMerchants.length > 1 ? "s" : ""} en{" "}
          {territory.regionName}, puis le reste du reseau national.
        </p>
      )}
    </section>
  );
}
