// src/context/territory-context.tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Place } from "../types";

interface Territory {
  path: string;
  name: string;
  kind: string;
  regionPath: string;
  regionName: string;
}

interface TerritoryContextValue {
  territory: Territory | null;
  setTerritory: (territory: Territory | null) => void;
  gazetteHref: string | null;
}

const STORAGE_KEY = "proxi-territory";

const TerritoryContext = createContext<TerritoryContextValue | null>(null);

function normalizeTerritory(raw: Territory): Territory {
  const regionPath = raw.regionPath || raw.path.split("/")[0];
  const regionName = raw.regionName || (raw.kind === "region" ? raw.name : regionPath);

  return {
    ...raw,
    regionPath,
    regionName,
  };
}

function readStoredTerritory(): Territory | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeTerritory(JSON.parse(raw) as Territory) : null;
  } catch {
    return null;
  }
}

export function TerritoryProvider({ children }: { children: ReactNode }) {
  const [territory, setTerritoryState] = useState<Territory | null>(() => readStoredTerritory());

  const setTerritory = useCallback((next: Territory | null) => {
    const normalized = next ? normalizeTerritory(next) : null;
    setTerritoryState(normalized);
    if (normalized) localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      territory,
      setTerritory,
      gazetteHref: territory ? `/gazette/territoire/${territory.path}` : null,
    }),
    [territory, setTerritory]
  );

  return <TerritoryContext.Provider value={value}>{children}</TerritoryContext.Provider>;
}

export function useTerritory() {
  const context = useContext(TerritoryContext);
  if (!context) throw new Error("useTerritory must be used within TerritoryProvider");
  return context;
}

export function syncTerritoryFromPlace(
  place: Place,
  path: string,
  breadcrumb: Place[],
  setTerritory: (territory: Territory | null) => void
) {
  if (place.kind === "country") {
    setTerritory(null);
    return;
  }

  const region = breadcrumb.find((item) => item.kind === "region");

  setTerritory({
    path,
    name: place.name,
    kind: place.kind,
    regionPath: region?.slug || path.split("/")[0],
    regionName: region?.name || place.name,
  });
}
