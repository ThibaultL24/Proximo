// src/components/layout/public-layout.tsx
import { Link, Outlet } from "react-router-dom";
import { useTerritory } from "../../context/territory-context";
import { gazetteTitle } from "../../lib/gazette-labels";
import { linkButtonClass } from "../ui/button";
import { useAuth } from "../../hooks/use-auth";

export function PublicLayout() {
  const { user, logout } = useAuth();
  const { territory, gazetteHref } = useTerritory();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-sand-dark/50 bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="group">
            <span className="block font-serif text-xl font-semibold text-petrol">Proxi Immo</span>
            <span className="block text-[10px] uppercase tracking-[0.25em] text-brass">
              {territory ? gazetteTitle(territory.name) : "Gazettes locales"}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-muted md:flex">
            {territory && gazetteHref ? (
              <Link to={gazetteHref} className="transition hover:text-petrol">
                {gazetteTitle(territory.name)}
              </Link>
            ) : (
              <Link to="/gazette" className="transition hover:text-petrol">
                Gazettes locales
              </Link>
            )}
            <Link to="/annuaire" className="transition hover:text-petrol">Commercants</Link>
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/espace-commercant"}
                  className="transition hover:text-petrol"
                >
                  Mon espace
                </Link>
                <button type="button" onClick={logout} className="transition hover:text-petrol">
                  Deconnexion
                </button>
              </>
            ) : (
              <Link to="/connexion" className="transition hover:text-petrol">Connexion</Link>
            )}
            <Link to="/connexion" className={linkButtonClass("accent", "hidden lg:inline-flex")}>
              J&apos;ai un projet immobilier
            </Link>
          </nav>

          <Link to="/annuaire" className={linkButtonClass("primary", "md:hidden text-xs px-3 py-2")}>
            Commercants
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-sand-dark/50 bg-petrol text-sand">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-lg text-surface">Proxi Immo</p>
            <p className="mt-1 text-sm text-sand/80">
              {territory
                ? `${gazetteTitle(territory.name)} — commerces et immobilier de proximite.`
                : "Gazettes locales, commerces de proximite et projets immobiliers."}
            </p>
          </div>
          <div className="flex gap-4 text-sm text-sand/90">
            {territory && gazetteHref ? (
              <Link to={gazetteHref} className="hover:text-surface">{gazetteTitle(territory.name)}</Link>
            ) : (
              <Link to="/gazette" className="hover:text-surface">Gazettes locales</Link>
            )}
            <Link to="/annuaire" className="hover:text-surface">Commercants</Link>
            <Link to="/connexion" className="hover:text-surface">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
