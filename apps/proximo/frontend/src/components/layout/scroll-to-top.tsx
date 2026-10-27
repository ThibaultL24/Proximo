// src/components/layout/scroll-to-top.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToPageTop();
  }, [pathname]);

  return null;
}
