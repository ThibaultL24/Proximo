#!/usr/bin/env python3
# scripts/generate_devis_pdf.py  - Génère le devis Code Immobilier en PDF

from pathlib import Path

from fpdf import FPDF

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
OUTPUT = Path(__file__).resolve().parent.parent / "docs" / "DEVIS-Code-Immobilier.pdf"

HTML = """
<style>
  body { font-family: DejaVu; font-size: 10pt; color: #1a1a1a; line-height: 1.4; }
  h1 { font-size: 16pt; margin-bottom: 4px; }
  h2 { font-size: 12pt; margin-top: 14px; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
  h3 { font-size: 10.5pt; margin-top: 10px; margin-bottom: 4px; }
  p { margin: 4px 0 8px 0; }
  .meta { font-size: 9.5pt; color: #333; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px 0; font-size: 9pt; }
  th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; }
  th { background-color: #f0f0f0; font-weight: bold; text-align: left; }
  td.center { text-align: center; }
  td.right { text-align: right; }
  ul { margin: 4px 0 8px 0; padding-left: 18px; }
  li { margin-bottom: 3px; }
  .highlight { background: #f9f9f9; font-weight: bold; }
  .note { font-size: 8.5pt; color: #555; font-style: italic; }
  .signatures { margin-top: 20px; }
  .signatures td { border: none; width: 50%; padding-top: 30px; }
  .page-break { page-break-before: always; }
  a { color: #333; text-decoration: none; font-size: 8.5pt; }
</style>

<h1>DEVIS - Application « Code Immobilier »</h1>
<p class="meta">
  <b>Prestataire :</b> [Votre nom / raison sociale]<br>
  <b>Client :</b> [Nom du client / agence immobilière]<br>
  <b>Date :</b> 17 juin 2025 &nbsp;|&nbsp; <b>Réf. :</b> DEV-CI-2025-001 &nbsp;|&nbsp; <b>Validité :</b> 30 jours
</p>

<h2>1. Objet du devis</h2>
<p>
  Conception, développement et mise en ligne d'une application web modulaire <b>Code Immobilier</b>,
  visant à valoriser les commerçants locaux, publier une gazette locale numérique, structurer un
  réseau d'apporteurs d'affaires (dépôt et suivi de leads), et fournir un espace de gestion à
  l'agence immobilière.
</p>

<h2>2. Périmètre fonctionnel</h2>
<table>
  <tr><th>Module</th><th>Description</th></tr>
  <tr><td>Front office public</td><td>Accueil, annuaire, fiches, gazette, pages QR</td></tr>
  <tr><td>Espace commerçant</td><td>Connexion, profil, dépôt de leads, suivi</td></tr>
  <tr><td>Back-office immobilier</td><td>Gestion commerçants, CMS, qualification leads</td></tr>
  <tr><td>Données &amp; logique métier</td><td>Users, secteurs, leads, commissions, QR</td></tr>
</table>

<h2>3. Stack technique retenue</h2>
<p>Pour maîtriser les coûts récurrents, architecture open source auto-hébergée :</p>
<table>
  <tr><th>Composant</th><th>Technologie</th></tr>
  <tr><td>Frontend</td><td>React 18 + Vite + Tailwind CSS</td></tr>
  <tr><td>Backend</td><td>Ruby on Rails 7+ (mode API)</td></tr>
  <tr><td>Base de données</td><td>PostgreSQL</td></tr>
  <tr><td>Authentification</td><td>Devise + JWT (rôles admin / commerçant)</td></tr>
  <tr><td>Paiements</td><td>Stripe + Stripe Connect</td></tr>
  <tr><td>Fichiers</td><td>Active Storage + Cloudflare R2</td></tr>
  <tr><td>QR codes</td><td>Gem rqrcode (Rails)</td></tr>
  <tr><td>Domaine .fr</td><td>IONOS</td></tr>
  <tr><td>Déploiement frontend</td><td>Vercel (plan Hobby)</td></tr>
  <tr><td>Déploiement backend</td><td>Render ou Fly.io</td></tr>
</table>

<h2>4. Référence tarifaire du marché</h2>
<table>
  <tr><th>Prestation</th><th>Fourchette marché</th></tr>
  <tr><td>Landing + annuaire géolocalisé</td><td class="right">3 500 - 5 000 €</td></tr>
  <tr><td>Fiches commerçants + QR</td><td class="right">1 500 - 2 500 €</td></tr>
  <tr><td>CMS / gazette locale</td><td class="right">2 000 - 3 500 €</td></tr>
  <tr><td>Espace commerçant + leads</td><td class="right">2 500 - 4 000 €</td></tr>
  <tr><td>Back-office + suivi leads</td><td class="right">2 500 - 4 000 €</td></tr>
  <tr><td>Stripe Connect (commissions)</td><td class="right">1 500 - 2 500 €</td></tr>
  <tr><td>Application complète</td><td class="right">12 000 - 18 000 €</td></tr>
  <tr><td>MVP fonctionnel (Ph. 1 à 4)</td><td class="right">8 000 - 12 000 €</td></tr>
</table>
<p class="note">Voir Annexe A pour les sources et la méthode de calcul.</p>

<h2>5. Mon offre - 3 000 € TTC</h2>
<h3>Conditions particulières</h3>
<p>
  Ce tarif est un <b>prix d'ami</b>, accordé en raison du lien personnel entre nos familles
  (ami de mon père). Il ne reflète pas la valeur marchande du projet et ne saurait servir de
  référence pour d'autres clients. Il correspond à environ <b>45-55 %</b> du tarif freelance
  habituel pour un périmètre comparable.
</p>

<h3>5.1 Prestations incluses</h3>
<table>
  <tr><th>#</th><th>Lot</th><th>Détail</th><th>Valeur marché</th></tr>
  <tr><td class="center">1</td><td>Setup technique</td><td>Rails API, PostgreSQL, structure projet</td><td class="right">400 €</td></tr>
  <tr><td class="center">2</td><td>Front office public</td><td>Accueil, annuaire, filtres secteur, fiches</td><td class="right">1 200 €</td></tr>
  <tr><td class="center">3</td><td>QR codes</td><td>Génération auto par commerçant, pages dédiées</td><td class="right">300 €</td></tr>
  <tr><td class="center">4</td><td>Gazette / CMS</td><td>Articles, catégories, gestion contenus</td><td class="right">800 €</td></tr>
  <tr><td class="center">5</td><td>Espace commerçant</td><td>Auth, profil, formulaire lead, suivi</td><td class="right">1 000 €</td></tr>
  <tr><td class="center">6</td><td>Back-office immo</td><td>Gestion commerçants, CMS, qualification leads</td><td class="right">1 200 €</td></tr>
  <tr><td class="center">7</td><td>Stripe (préparation)</td><td>Setup compte, webhooks, modèle commissions</td><td class="right">400 €</td></tr>
  <tr><td class="center">8</td><td>Mise en production</td><td>Déploiement Vercel + Render, config domaine IONOS</td><td class="right">300 €</td></tr>
  <tr><td class="center">9</td><td>Support post-lancement</td><td>1 mois corrections et ajustements mineurs</td><td class="right">300 €</td></tr>
  <tr class="highlight"><td colspan="3"><b>Total valeur marché estimée</b></td><td class="right"><b>5 900 €</b></td></tr>
  <tr class="highlight"><td colspan="3"><b>Prix accordé (prix d'ami)</b></td><td class="right"><b>3 000 € TTC</b></td></tr>
</table>

<h3>5.2 Hors périmètre</h3>
<table>
  <tr><th>Prestation</th><th>Tarif indicatif</th></tr>
  <tr><td>Stripe Connect - virements actifs aux apporteurs</td><td class="right">800 - 1 200 €</td></tr>
  <tr><td>Carte interactive avancée (Mapbox)</td><td class="right">400 - 600 €</td></tr>
  <tr><td>Notifications email automatiques</td><td class="right">300 - 500 €</td></tr>
  <tr><td>Design graphique sur mesure (Figma)</td><td class="right">800 - 1 500 €</td></tr>
  <tr><td>Maintenance mensuelle (2 h/mois)</td><td class="right">80 - 120 €/mois</td></tr>
</table>

<div class="page-break"></div>

<h2>6. Frais récurrents à la charge du client</h2>
<p class="note">Non inclus dans le devis. Facturés directement par les prestataires.</p>

<h3>6.1 Nom de domaine - IONOS</h3>
<table>
  <tr><th>Poste</th><th>Année 1</th><th>Années suiv.</th><th>Notes</th></tr>
  <tr><td>Domaine .fr</td><td>~1 € HT</td><td>~10 € HT/an</td><td>Promo an 1 ; ~12 € TTC/an ensuite</td></tr>
</table>

<h3>6.2 Deploiement - Vercel (frontend React)</h3>
<table>
  <tr><th>Plan</th><th>Coût</th><th>Usage</th></tr>
  <tr><td>Hobby (gratuit)</td><td>0 €/mois</td><td>Suffisant pour le MVP local</td></tr>
  <tr><td>Pro</td><td>~18 €/mois</td><td>Si trafic ou besoins équipe</td></tr>
</table>
<p class="note">Vercel ne vend pas les domaines .fr - achat chez IONOS, DNS pointe vers Vercel.</p>

<h3>6.3 Backend Rails - Render / Fly.io</h3>
<table>
  <tr><th>Option</th><th>Coût</th><th>Notes</th></tr>
  <tr><td>Render Free</td><td>0 €/mois</td><td>Limité (sleep après inactivité)</td></tr>
  <tr><td>Render Starter</td><td>~7 €/mois</td><td>Recommandé en production</td></tr>
  <tr><td>PostgreSQL Render</td><td>0-7 EUR/mois</td><td>Free tier ou plan payant</td></tr>
</table>

<h3>6.4 Stripe - Commissions</h3>
<table>
  <tr><th>Élément</th><th>Coût</th></tr>
  <tr><td>Compte Stripe</td><td>Gratuit</td></tr>
  <tr><td>Paiement carte EU</td><td>1,5 % + 0,25 € / transaction</td></tr>
  <tr><td>Stripe Connect (virements)</td><td>0,25 % + 0,10 € / virement</td></tr>
</table>

<h3>6.5 Synthèse frais récurrents</h3>
<table>
  <tr><th>Scénario</th><th>Coût mensuel</th><th>Coût annuel</th></tr>
  <tr><td>Lancement (MVP local)</td><td>0 - 7 €</td><td>~12 - 96 €</td></tr>
  <tr><td>Croissance (Vercel Pro + Render)</td><td>~25 €</td><td>~300 € + domaine</td></tr>
</table>

<h2>7. Planning indicatif</h2>
<table>
  <tr><th>Phase</th><th>Durée</th><th>Livrable</th></tr>
  <tr><td>Ph. 1 - Setup + annuaire</td><td>Sem. 1-3</td><td>Site public avec annuaire</td></tr>
  <tr><td>Ph. 2 - Fiches + QR</td><td>Sem. 3-4</td><td>Fiches commercants operationnelles</td></tr>
  <tr><td>Ph. 3 - Gazette</td><td>Sem. 5-6</td><td>CMS et premiers articles</td></tr>
  <tr><td>Ph. 4 - Espace commercant</td><td>Sem. 7-9</td><td>Portail partenaire + leads</td></tr>
  <tr><td>Ph. 5 - Back-office + Stripe</td><td>Sem. 10-12</td><td>Dashboard admin + commissions</td></tr>
  <tr><td>Recette + mise en ligne</td><td>Sem. 12</td><td>Application en production</td></tr>
</table>
<p><b>Durée totale estimée :</b> 10 à 12 semaines.</p>

<h2>8. Conditions financières</h2>
<table>
  <tr><th>Échéance</th><th>Montant</th><th>Condition</th></tr>
  <tr><td>Acompte (40 %)</td><td class="right">1 200 €</td><td>À la signature</td></tr>
  <tr><td>Milieu de projet (30 %)</td><td class="right">900 €</td><td>Validation Phase 3 (gazette)</td></tr>
  <tr><td>Solde (30 %)</td><td class="right">900 €</td><td>Mise en production et recette</td></tr>
  <tr class="highlight"><td><b>Total</b></td><td class="right"><b>3 000 € TTC</b></td><td></td></tr>
</table>
<ul>
  <li>Paiement par virement bancaire sous 15 jours.</li>
  <li>TVA : [à préciser selon votre statut].</li>
  <li>Hors périmètre : facturation au temps passé (35-45 EUR/h) après accord écrit.</li>
</ul>

<h2>9. Conditions générales</h2>
<ul>
  <li>Propriété du code : transfert au client après paiement intégral.</li>
  <li>Contenus : textes, images et logos fournis par le client.</li>
  <li>Recette : 15 jours après livraison pour bugs bloquants inclus.</li>
  <li>Support inclus : 1 mois post-lancement (corrections mineures).</li>
  <li>Confidentialité : échanges et documents restent confidentiels.</li>
</ul>

<h2>10. Synthèse</h2>
<table>
  <tr><th></th><th>Montant</th></tr>
  <tr><td>Valeur marché estimée (périmètre décrit)</td><td class="right">~5 900 €</td></tr>
  <tr><td>Fourchette marché équivalente</td><td class="right">8 000 - 12 000 €</td></tr>
  <tr><td>Prix proposé (prix d'ami)</td><td class="right"><b>3 000 € TTC</b></td></tr>
  <tr><td>Économie réalisée par le client</td><td class="right">~2 900 - 9 000 €</td></tr>
</table>

<h3>Bon pour accord</h3>
<table class="signatures">
  <tr>
    <td><b>Le prestataire</b></td>
    <td><b>Le client</b></td>
  </tr>
  <tr>
    <td>Nom : _________________________</td>
    <td>Nom : _________________________</td>
  </tr>
  <tr>
    <td>Date : _________________________</td>
    <td>Date : _________________________</td>
  </tr>
  <tr>
    <td>Signature :</td>
    <td>Signature :</td>
  </tr>
</table>

<div class="page-break"></div>

<h2>ANNEXE A - Sources et methodologie</h2>
<p class="note">Document consulté le 17 juin 2025. Tarifs susceptibles d'évoluer.</p>

<h3>A.1 Méthode de calcul</h3>
<p>
  <b>Coût d'un lot = Jours estimés × TJM.</b> TJM marché retenu : 500 €/jour HT (dev full-stack confirmé).
  TJM implicite prix d'ami : ~273 €/jour (3 000 € ÷ 11 jours).
</p>

<h3>A.2 Sources - TJM developpeurs freelance</h3>
<ul>
  <li>[1] Silkhom Barometre TJM 2025 - silkhom.com/barometre-des-tjm-informatique-electronique-digital/</li>
  <li>[2] Indy Guide TJM - indy.fr/guide/freelance/salaire/tjm-developpeur/</li>
  <li>[3] Freelance Solution TJM 2026 - freelance-solution.fr/tarif-freelance/tarif-freelance-developpeur/</li>
  <li>[4] Meaflow TJM Full-Stack - meaflow.com/calculateurs/tjm/metier/developpeur-full-stack/</li>
  <li>[5] Le-TJM Tarifs 2025 - le-tjm.fr/article/tjm-par-metier-freelance-2025</li>
  <li>[6] Bendavakan Tarif dev web 2025 - bendavakan.com/quel-est-le-tarif-moyen-dun-developpeur-web-en-2025/</li>
  <li>[7] Malt - malt.fr/a/freelance/tech/developpeur-full-stack</li>
</ul>

<h3>A.3 Sources - Cout application web / MVP</h3>
<ul>
  <li>[8] Aquilapp - aquilapp.fr/ressources/developpement-sur-mesure/cout-application-web-sur-mesure</li>
  <li>[9] EID Lab Prix MVP - eid-lab.com/blog/prix-developpement-mvp-devis-reels</li>
  <li>[10] Agence Scroll - agence-scroll.com/blog/cout-developpement-dune-application-web</li>
  <li>[11] Ary Studio - ary.studio/mvp/prix/</li>
</ul>

<h3>A.4 Sources - Frais recurrents</h3>
<ul>
  <li>[12] Vercel Pricing  - vercel.com/pricing</li>
  <li>[13] Vercel Pro Plan  - vercel.com/docs/plans/pro-plan</li>
  <li>[14] Vercel .fr non disponible  - community.vercel.com/t/french-fr-tld-buying/408</li>
  <li>[15] IONOS domaines  - ionos.fr/digitalguide/domaines/gestion-de-domaine/comparatif-des-meilleurs-fournisseurs-de-domaine/</li>
  <li>[16] Render Pricing  - render.com/pricing</li>
  <li>[17] Stripe FR  - stripe.com/fr/pricing</li>
  <li>[18] Stripe Connect  - stripe.com/fr/connect/pricing</li>
  <li>[19] Cloudflare R2  - cloudflare.com/products/r2/</li>
</ul>

<h3>A.5 Détail par lot (valeur marché)</h3>
<table>
  <tr><th>Lot</th><th>Jours</th><th>TJM</th><th>Calcul</th><th>Montant</th></tr>
  <tr><td>Setup technique</td><td>0,8 j</td><td>500 €</td><td>0,8 × 500</td><td class="right">400 €</td></tr>
  <tr><td>Front office</td><td>2,4 j</td><td>500 €</td><td>2,4 × 500</td><td class="right">1 200 €</td></tr>
  <tr><td>QR codes</td><td>0,6 j</td><td>500 €</td><td>0,6 × 500</td><td class="right">300 €</td></tr>
  <tr><td>CMS / Gazette</td><td>1,6 j</td><td>500 €</td><td>1,6 × 500</td><td class="right">800 €</td></tr>
  <tr><td>Espace commerçant</td><td>2,0 j</td><td>500 €</td><td>2,0 × 500</td><td class="right">1 000 €</td></tr>
  <tr><td>Back-office</td><td>2,4 j</td><td>500 €</td><td>2,4 × 500</td><td class="right">1 200 €</td></tr>
  <tr><td>Stripe setup</td><td>0,8 j</td><td>500 €</td><td>0,8 × 500</td><td class="right">400 €</td></tr>
  <tr><td>Mise en prod.</td><td>0,6 j</td><td>500 €</td><td>0,6 × 500</td><td class="right">300 €</td></tr>
  <tr><td>Support 1 mois</td><td>0,6 j</td><td>500 €</td><td>0,6 × 500</td><td class="right">300 €</td></tr>
  <tr class="highlight"><td colspan="4"><b>Total (~11 jours)</b></td><td class="right"><b>5 900 €</b></td></tr>
</table>

<h3>A.6 Architecture &amp; DNS</h3>
<p>
  <b>codeimmobilier.fr</b> (IONOS) → <b>www</b> → Vercel (React) | <b>api</b> → Render (Rails API).
  Vercel ne supporte pas Rails ; le backend est déployé séparément.
</p>

<h3>A.7 Limites et réserves</h3>
<ul>
  <li>Estimations indicatives basées sur baromètres publics.</li>
  <li>Contenus (textes, logos, photos) fournis par le client.</li>
  <li>Design sur templates Tailwind, pas de maquettes Figma sur mesure.</li>
  <li>Stripe Connect actif (virements) en option Phase 5 complète.</li>
  <li>Promo IONOS 1 € an 1 : renouvellement ~10 € HT/an à prévoir.</li>
</ul>
"""


def generate():
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_font("DejaVu", "", FONT_REG)
    pdf.add_font("DejaVu", "B", FONT_BOLD)
    pdf.set_font("DejaVu", "", 10)
    pdf.add_page()
    pdf.write_html(HTML, font_family="DejaVu")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUTPUT))
    print(f"PDF genere : {OUTPUT} ({pdf.page_no()} pages)")


if __name__ == "__main__":
    generate()
