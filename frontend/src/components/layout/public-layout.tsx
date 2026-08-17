// src/components/layout/public-layout.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "../public/bottom-nav";
import { BrandMark } from "../brand/brand-mark";
import { BRAND } from "../../lib/brand";
import { PUBLIC_NAV } from "../../lib/public-nav";
import { linkButtonClass } from "../ui/button";
import { useAuth } from "../../hooks/use-auth";
import { homePathForRole } from "../../lib/auth-redirect";

export function PublicLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-3 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tile"
            >
              <BrandMark className="h-9 w-9 shrink-0 text-ink" />
              <span className="min-w-0">
                <span className="block truncate font-serif text-xl font-semibold leading-none tracking-tight">
                  {BRAND.name}
                </span>
                <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  {BRAND.territoryLabel}
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
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
              <Link to="/inscription" className={linkButtonClass("accent", "text-xs sm:text-sm")}>
                Rejoindre
              </Link>
            </div>
          </div>

          <nav
            aria-label="Navigation principale"
            className="no-scrollbar -mx-1 hidden gap-1 overflow-x-auto border-t border-line md:flex"
          >
            {PUBLIC_NAV.map((item) => {
              const active = item.match(location.pathname);
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-tile",
                    active
                      ? "border-tile text-ink"
                      : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-line bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
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
    </div>
  );
}
