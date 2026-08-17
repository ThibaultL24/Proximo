# Design — Prototype démo Fenêtre Ouverte

Date: 2026-08-17  
Produit: Fenêtre Ouverte (ProxImo) · territoire 07700

## Objectif

Prototype client **crédible et utilisable** : tous les flux visibles, fonctionnels, illustrés par une seed lorem. Pas un go-live carte réelle.

## Décisions verrouillées

| Sujet | Décision |
|--------|----------|
| Identité visuelle | Palette papier / encre / tuile, Newsreader. Inspiration Nestenn / Green-Acres (photo-first, cartes, preuve sociale) **sans copie**. |
| Accueil | Page **produit** : promesse, pour qui, comment ça marche, teaser tarifs. Pas un mur d’actu. |
| Tarifs | Page `/tarifs`. Citoyen 2 €, commerçant 12 € (unifier l’UI qui affiche 19 €), agence 125 €. |
| Avis | 1 avis + 1 réponse (Tripadvisor). Cibles : fiche commerçant, articles, posts du fil. Note 1–5 optionnelle. |
| Boutique | Page publique, SKU test, cas Stripe (promo, abo, plusieurs fois, produit agence vs commerçant). |
| QR | Compteur unifié, parcours PDF → scan → fiche. Feature cœur, pas polish. |
| Commissions | Barème visible, split, Checkout destination + `application_fee_amount`. |
| Réseaux | Facebook, Instagram, TikTok. LinkedIn **retiré de l’UI**. Fil commerçant uniquement. |
| Connexion réseaux | Questionnaire pages (admin + commerçant) puis OAuth. Secrets app **jamais** dans le profil commerçant. |
| App Meta / TikTok | Une app ProxImo (`.env` ou formulaire super-admin chiffré). Mode démo si clés absentes. |
| Seeds | Lorem conservé (pas d’infos partenaires). Chaque capacité a un exemple cliquable. |
| Lots | 1 QR+argent+stats → 2 site public+avis → 3 boutique → 4 réseaux → 5 seed |

---

## 1. Publication 1 clic (commerçant)

### Garantie

Le commerçant publie **en un submit** sur le fil Fenêtre Ouverte **et** sur **tous les réseaux qu’il a renseignés et connectés**.

| État | Effet au publier |
|------|------------------|
| Renseigné + connecté (OAuth live ou `demo`) | Post envoyé |
| Renseigné, pas encore Connecter | Case grisée, pas d’envoi. CTA Connecter |
| Non renseigné | Réseau absent du formulaire |
| Envoi live échoue sur un réseau | Les autres continuent ; statut `failed` sur celui-là |

Le questionnaire **ne remplace pas** OAuth : il dit *quelle* page. **Connecter** (une fois par réseau) donne le droit de poster. Ensuite, 1 clic suffit.

Les images testées sur ProxImo et la page Facebook créée restent sur le **fil commerçant** (`Publication`), jamais sur les articles admin.

### Questionnaire pages

Champs sur la fiche commerçant (admin peut pré-remplir, commerçant peut compléter) :

- URL page Facebook
- Identifiant Instagram
- Identifiant TikTok

Pas de mot de passe, pas d’App Secret, pas de token collé à la main.

### Connecter

Pour chaque réseau renseigné : bouton Connecter.

- Clés app présentes → OAuth Meta (FB/IG) ou TikTok.
- Clés absentes ou token `demo` → connexion démo explicite (déjà le pattern actuel).
- Token stocké sur `social_accounts` (merchant_id), pas dans `users`.

Admin : voit les URLs et l’état connecté / démo / erreur. **Ne poste pas** à la place du commerçant.

Citoyen : pas de questionnaire réseaux.

### Publier

1. Texte + photo optionnelle + rubrique (inchangé).
2. Cases FB / IG / TikTok cochées par défaut si renseigné **et** connecté.
3. Submit → `PublicationCreator` → fil FO toujours → `SocialPublishOrchestrator` sur les providers cochés.
4. Historique : badge par réseau (publié / démo / échec).

Instagram live : photo requise (règle API actuelle). Sans photo : IG `skipped` + message, FB/TikTok/fil inchangés.

### App plateforme (sortir du .env à terme)

Écran **super-admin** : App ID / secret Meta et TikTok, chiffrés, jamais réaffichés. En attendant, `.env` reste valide. Une seule app pour tout le réseau ; le post sort sur **la page du commerçant**.

---

## 2. QR

- Incrémenter / lire le même compteur que `qr_scans` (aujourd’hui `merchants.qr_scan_count` n’est pas mis à jour).
- `FRONTEND_URL` de démo (pas localhost) dans le PNG/PDF.
- Scan public seulement si commerçant **published**.
- Seed : quelques scans pour que admin et dashboard commerçant affichent le même chiffre.

---

## 3. Argent

- Barème commission (forfait ou % selon type de lead), plus de `window.prompt` comme seul UX.
- Destination charge + `application_fee_amount` (cut plateforme visible).
- Agenda factures Stripe (3 plans) : ouverte / payée / échouée, prochaine échéance, lien portail.
- Stats agence : à payer vs payé, conversion lead→commission, scans QR, MRR (pas seulement des compteurs).

Hors démo carte réelle : Accounts v2, refunds UI, RAK.

---

## 4. Site public

**Home :** hero photo, pour qui (habitant / commerçant / agence), comment ça marche (QR → fiche → fil → avis → 1 clic réseaux), teaser tarifs, CTA. Corriger « Facebook bientôt ».

**`/tarifs` :** grille 2 € / 12 € / 125 €, inclusions (QR, avis, 3 réseaux, boutique, leads), essais, CTA inscription.

**Design listes :** cartes photo-first (commerces, boutique), pas Nestenn teal ni Green-Acres lime.

---

## 5. Avis 1+1

Table polymorphe `reviews` : `Merchant` | `Article` | `Publication`.

- 1 avis par `(user, reviewable)`.
- 1 réponse : commerçant sur sa fiche / son post ; auteur agence sur l’article.
- Auteurs : client **et** commerçant connectés.
- Agence peut masquer. Pas d’édition après envoi.
- Anonyme → lien connexion.

---

## 6. Boutique

Route publique `/boutique`. SKU lorem, Checkout par cas : paiement unique, code promo, abonnement, paiement en plusieurs fois (méthodes Dashboard, pas `payment_method_types` en dur). Produit agence = charge plateforme ; produit commerçant = destination + fee.

---

## 7. Seeds (lorem)

Ne pas attendre les textes partenaires. Enrichir pour qu’on puisse cliquer :

- Commerçant avec QR + scans, 3 réseaux démo, 1 post syndiqué, avis + réponse, 1 produit boutique.
- Client avec abo, lead, 1 avis.
- Agence avec licence, commissions dans les 3 statuts utiles, stats non vides.
- Compte super-admin inchangé (`super@fenetreouverte.fr` / `password123`).

---

## Hors scope

- Copy partenaires réelle, LinkedIn, X.
- Mot de passe / clé API dans un formulaire commerçant.
- Admin qui publie sur les pages Facebook des commerçants.
- Stock / logistique boutique réelle.
- App Review Meta/TikTok production (la démo utilise `demo` tant que l’app n’est pas validée).

## Erreurs

- Un réseau down n’annule pas le fil FO ni les autres réseaux.
- Questionnaire incomplet : on publie seulement sur le sous-ensemble connecté.
- Clés app manquantes : tout le monde reste en démo, le discours commercial ne change pas.
