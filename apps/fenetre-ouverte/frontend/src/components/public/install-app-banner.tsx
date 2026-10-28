// src/components/public/install-app-banner.tsx
import { useEffect, useState } from "react";

const DISMISS_KEY = "fo-pwa-banner-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let cachedPrompt: BeforeInstallPromptEvent | null = null;
let listening = false;
const subscribers = new Set<(event: BeforeInstallPromptEvent | null) => void>();

function startPromptListener() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    cachedPrompt = event as BeforeInstallPromptEvent;
    subscribers.forEach((notify) => notify(cachedPrompt));
  });
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean((window.navigator as { standalone?: boolean }).standalone))
  );
}

function isIos() {
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function useDeferredPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(cachedPrompt);

  useEffect(() => {
    startPromptListener();
    function notify(event: BeforeInstallPromptEvent | null) {
      setInstallEvent(event);
    }
    subscribers.add(notify);
    return () => {
      subscribers.delete(notify);
    };
  }, []);

  return installEvent;
}

export function InstallAppLink({ className = "" }: { className?: string }) {
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
  }, []);

  if (installed) return null;

  return (
    <a href="#installer-app" className={className}>
      Installer l’app
    </a>
  );
}

export function InstallAppBanner() {
  const installEvent = useDeferredPrompt();
  const [showIosHint, setShowIosHint] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    function openFromHash() {
      if (window.location.hash === "#installer-app") setIsVisible(true);
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    if (localStorage.getItem(DISMISS_KEY)) {
      return () => window.removeEventListener("hashchange", openFromHash);
    }

    if (isIos()) {
      setShowIosHint(true);
      setIsVisible(true);
    }

    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  useEffect(() => {
    if (installEvent && !localStorage.getItem(DISMISS_KEY) && !isStandalone()) {
      setShowIosHint(false);
      setIsVisible(true);
    }
  }, [installEvent]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setIsVisible(false);
    if (window.location.hash === "#installer-app") {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    cachedPrompt = null;
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <aside
      className="fixed inset-x-3 z-50 rounded-lg border border-line bg-surface p-3 shadow-lg bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-6 md:right-6 md:w-80"
      role="dialog"
      aria-label="Installer l'application"
    >
      <p className="font-serif text-base font-semibold text-ink">Installer Fenêtre Ouverte</p>
      {showIosHint || !installEvent ? (
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {isIos()
            ? "Sur iPhone : bouton Partager, puis « Sur l’écran d’accueil »."
            : "Sur ordinateur : menu Chrome ⋮ → « Installer Fenêtre Ouverte ». Sur Android : le navigateur propose l’installation tout seul."}
        </p>
      ) : (
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          Accès rapide depuis l’écran d’accueil, comme une appli.
        </p>
      )}
      <div className="mt-3 flex gap-2">
        {installEvent && (
          <button
            type="button"
            onClick={install}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-tile px-3 py-2 text-sm font-semibold text-white"
          >
            Installer
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink-muted"
        >
          Fermer
        </button>
      </div>
    </aside>
  );
}
