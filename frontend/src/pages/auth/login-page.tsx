// src/pages/auth/login-page.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminAlert, adminInputClass } from "../../components/admin/admin-ui";
import { buttonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../hooks/use-auth";
import { homePathForRole } from "../../lib/auth-redirect";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      navigate(homePathForRole(user.role));
    } catch {
      setError("Identifiants invalides");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">Espace pro</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-petrol">Connexion</h1>
        <p className="mt-2 text-sm text-ink-muted">Commercants, citoyens et equipe agence</p>
      </div>

      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={adminInputClass}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={adminInputClass}
            required
          />
          {error && <AdminAlert>{error}</AdminAlert>}
          <button type="submit" className={`${buttonClass("primary")} w-full`}>
            Se connecter
          </button>
        </form>
        <p className="border-t border-sand-dark/40 px-6 py-4 text-center text-sm text-ink-muted">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="font-medium text-petrol hover:text-brass">
            S&apos;inscrire
          </Link>
        </p>
        <p className="border-t border-sand-dark/40 px-6 py-3 text-center text-xs text-ink-muted">
          Demo : super@fenetreouverte.fr · admin@fenetreouverte.fr · martin@boulangerie.fr · client@demo.fr / password123
          {" · "}
          <Link to="/agence/inscription" className="font-medium text-petrol hover:text-brass">
            Licence agence
          </Link>
        </p>
      </Card>
    </div>
  );
}
