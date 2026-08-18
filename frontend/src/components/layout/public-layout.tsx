// src/components/layout/public-layout.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { BrandMark } from "../brand/brand-mark";
import { BottomNav } from "../public/bottom-nav";
import { InstallAppBanner, InstallAppLink } from "../public/install-app-banner";
import { BRAND } from "../../lib/brand";
import { PUBLIC_NAV } from "../../lib/public-nav";
import { linkButtonClass } from "../ui/button";
import { useAuth } from "../../hooks/use-auth";
import { homePathForRole } from "../../lib/auth-redirect";
import { scrollToPageTop } from "./scroll-to-top";

export function PublicLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-2 py-2.5 sm:gap-4 sm:py-3">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tile sm:gap-3"
            >
              <BrandMark className="h-8 w-8 shrink-0 text-ink sm:h-9 sm:w-9" />
              <span className="min-w-0">
                <span className="block truncate font-serif text-lg font-semibold leading-none tracking-tight sm:text-xl">
                  {BRAND.name}
                </span>
                <span className="mt-1 hidden truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted sm:block">
                  {BRAND.territoryLabel}
                </span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  <Link
                    to={homePathForRole(user.role)}
                    className="hidden text-sm font-semibold text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tile sm:inline"
                  >
                    Mon espace
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="hidden text-sm font-semibold text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tile sm:inline"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  to="/connexion"
                  className="hidden text-sm font-semibold text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tile sm:inline"
                >
                  Connexion
                </Link>
              )}
              <InstallAppLink className="hidden text-sm font-semibold text-ink-muted hover:text-ink md:inline" />
              <Link
                to="/inscription"
                className={linkButtonClass("accent", "px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm")}
              >
                Rejoindre
              </Link>
            </div>
          </div>

          <nav
            aria-label="Navigation principale"
            className="-mx-4 flex items-stretch justify-between gap-1 border-t border-line px-3 sm:mx-0 sm:justify-start sm:gap-1 sm:px-0"
          >
            {PUBLIC_NAV.map((item) => {
              const active = item.match(location.pathname);
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={scrollToPageTop}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "whitespace-nowrap px-0 py-2.5 text-center text-[10px] font-semibold tracking-tight transition min-[375px]:text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-tile sm:px-3 sm:py-3 sm:text-sm sm:tracking-normal",
                    active
                      ? "border-b-2 border-tile text-ink"
                      : "border-b-2 border-transparent text-ink-muted hover:border-line-strong hover:text-ink",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-8">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-line bg-ink pb-[calc(4.25rem+env(safe-area-inset-bottom))] text-paper md:pb-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10 lg:py-12">
          <div>
            <div className="flex items-center gap-3 text-white">
              <BrandMark className="h-8 w-8" />
              <p className="font-serif text-2xl">{BRAND.name}</p>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/65">{BRAND.tagline}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-paper/45">
              {BRAND.territoryLabel}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/45">Parcourir</p>
            <ul className="mt-3 space-y-2 text-sm text-paper/80">
              {PUBLIC_NAV.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/45">Pratique</p>
            <ul className="mt-3 space-y-2 text-sm text-paper/80">
              <li>
                <Link to="/commerces" className="hover:text-white">
                  Commerces & partenaires
                </Link>
              </li>
              <li>
                <Link to="/boutique" className="hover:text-white">
                  Boutique
                </Link>
              </li>
              <li>
                <Link to="/tarifs" className="hover:text-white">
                  Tarifs
                </Link>
              </li>
              <li>
                <InstallAppLink className="hover:text-white" />
              </li>
              <li>
                <Link to="/connexion" className="hover:text-white">
                  Espace partenaire
                </Link>
              </li>
              <li>
                <Link to="/inscription" className="hover:text-white">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-paper/40">
            Fenêtre Ouverte — infos, commerces et vie quotidienne dans le 07700.
          </p>
        </div>
      </footer>

      <BottomNav />
      <InstallAppBanner />
    </div>
  );
}
