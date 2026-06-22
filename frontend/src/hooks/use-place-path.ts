// src/hooks/use-place-path.ts
import { useMemo } from "react";
import { useParams } from "react-router-dom";

export function usePlacePath() {
  const params = useParams();

  return useMemo(() => {
    const slugs = [params.region, params.department, params.city, params.district].filter(Boolean) as string[];
    return {
      slugs,
      path: slugs.join("/"),
    };
  }, [params.region, params.department, params.city, params.district]);
}
