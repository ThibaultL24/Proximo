// src/pages/auth/agency-signup-page.tsx
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { registerAgency } from "../../api/agency-auth";
import { createAgencySubscriptionCheckout } from "../../api/agency-billing";
import { AdminAlert, adminInputClass } from "../../components/admin/admin-ui";
import { buttonClass, linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export function AgencySignupPage() {
  const [agencyName, setAgencyName] = useState("");
  const [city, setCity] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await registerAgency({
        agency_name: agencyName,
        city,
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone: phone || undefined,
      });

      const checkoutUrl = await createAgencySubscriptionCheckout();
      window.location.href = checkoutUrl;
    } catch {
      setError("Inscription impossible. Verifiez vos informations.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">Licence agence</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-petrol">Deployer Proxi Immo</h1>
        <p className="mt-2 text-sm text-ink-muted">
          125 € / mois — annuaire, gazette, pipeline leads et réseau commerçants pour votre agence
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
          <input
            type="text"
            placeholder="Nom de l'agence *"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className={adminInputClass}
            required
          />
          <input
            type="text"
            placeholder="Ville principale"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={adminInputClass}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Prenom"
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
            placeholder="Email administrateur *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={adminInputClass}
            required
          />
          <input
            type="tel"
            placeholder="Telephone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={adminInputClass}
          />
          <input
            type="password"
            placeholder="Mot de passe (8 caracteres min.) *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={adminInputClass}
            minLength={8}
            required
          />
          {error && <AdminAlert>{error}</AdminAlert>}
          <button type="submit" disabled={isSubmitting} className={`${buttonClass("primary")} w-full`}>
            {isSubmitting ? "Création…" : "Créer mon agence — essai 14 jours"}
          </button>
        </form>
        <p className="border-t border-sand-dark/40 px-6 py-4 text-center text-sm text-ink-muted">
          Déjà partenaire ?{" "}
          <Link to="/connexion" className="font-medium text-petrol hover:text-brass">
            Se connecter
          </Link>
        </p>
      </Card>

      <div className="mt-6 text-center">
        <Link to="/" className={linkButtonClass("ghost", "text-sm")}>
          Retour au site
        </Link>
      </div>
    </div>
  );
}
