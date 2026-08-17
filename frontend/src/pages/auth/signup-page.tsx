// src/pages/auth/signup-page.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AdminAlert, adminInputClass } from "../../components/admin/admin-ui";
import { buttonClass, linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../hooks/use-auth";
import { homePathForRole } from "../../lib/auth-redirect";

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const merchantSlug = searchParams.get("merchant");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await register({
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone: phone || undefined,
      });

      const base = homePathForRole(user.role);
      const next = merchantSlug ? `${base}/leads/nouveau?merchant=${merchantSlug}` : base;
      navigate(next);
    } catch {
      setError("Inscription impossible. Verifiez vos informations.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">Espace citoyen</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-petrol">Créer un compte</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Gratuit pour consulter l&apos;annuaire — 2 €/mois pour transmettre un projet immo
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={adminInputClass}
            />
            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={adminInputClass}
            />
          </div>
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={adminInputClass}
            required
          />
          <input
            type="tel"
              placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={adminInputClass}
          />
          <input
            type="password"
              placeholder="Mot de passe (8 caractères min.) *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={adminInputClass}
              minLength={8}
              required
            />
            {error && <AdminAlert>{error}</AdminAlert>}
            <button type="submit" disabled={isSubmitting} className={`${buttonClass("primary")} w-full`}>
              {isSubmitting ? "Création…" : "Créer mon compte"}
            </button>
          </form>
          <p className="border-t border-sand-dark/40 px-6 py-4 text-center text-sm text-ink-muted">
            Déjà inscrit ?{" "}
          <Link to="/connexion" className="font-medium text-petrol hover:text-brass">
            Se connecter
          </Link>
        </p>
      </Card>

      {merchantSlug && (
        <p className="mt-4 text-center text-sm text-ink-muted">
          Apres inscription, vous pourrez transmettre votre projet via le commercant selectionne.
        </p>
      )}

      <div className="mt-6 text-center">
        <Link to="/commerces" className={linkButtonClass("ghost", "text-sm")}>
          Continuer sans compte
        </Link>
      </div>
    </div>
  );
}
