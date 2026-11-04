# Diffusion multicanale — séparation et suppression progressive de l'ancien produit

## Architecture cible

- **Fenêtre Ouverte** : média et réseau local. Le commerçant prépare une publication, choisit des réseaux connectés et la soumet à la modération de Jean-Michel. Le fil FO est la destination principale.
- **Proximo** : recommandations et dossiers privés, ainsi qu'un nouvel atelier indépendant de brouillons d'annonces immobilières. Les champs d'annonces ne sont **jamais** extraits automatiquement des coordonnées privées d'un client.
- Aucune communication directe d'une base ou d'un jeton d'authentification à l'autre.
- Une destination externe n'est pas « publiée » avant confirmation par le prestataire ; aucune API non autorisée, scraping, publication cachée ni spam sur blogs publics.

## Ce qui est en place dans ce lot

### Fenêtre Ouverte

- Route commerçant `/espace-commercant/publier` : atelier plus explicite en quatre étapes, catalogue des onze destinations et état clair (OAuth requis, simulation, payant, prévu).
- Nouvelle API protégée `GET /api/v1/merchant/social_channels`.
- Conservation des adaptateurs Meta/TikTok existants, sans prétendre qu'ils sont tous homologués ni que les versions Graph API resteront valides en production.
- Envoi **asynchrone** via `SocialPublishJob`, dédoublonnage simple par état `pending / processing / published / failed / skipped`.
- Important : un compte de démonstration ou une plateforme mal configurée est enregistré comme **non envoyé**, jamais comme une publication extérieure réelle.
- Après validation et publication FO, bouton « Copier le texte et le lien » pour distribuer manuellement sur une destination choisie par l'utilisateur.
- Les textes/photos/QR et les modules média utiles sont conservés.
- Tests de non-confusion démo/live ajoutés.

**Limites avant production :**
- Connecter réellement les plateformes avec OAuth et revue des droits, vérifier les quotas/permissions, renouvellement des tokens et règles propres à chaque média.
- Les nouveaux jetons OAuth sont chiffrés à l'écriture avec `PlatformSecrets` (clé issue de `secret_key_base`). La lecture des anciennes lignes en clair reste compatible pendant la transition.
- **Migration préalable à la production** : sauvegarder la base et exécuter `bin/rails social:encrypt_legacy_tokens` une fois, puis vérifier que chaque valeur est préfixée `enc:v1:`. La tâche est idempotente ; conserver une politique sûre de sauvegarde et rotation de la clé Rails.
- Les paramètres complets des callbacks OAuth ne sont plus écrits dans les logs.
- Configurer une file de tâches *persistante* et gérer les retries sans double diffusion (en cas de timeout après envoi externe, demander une vérification manuelle).
- Ne jamais déployer la version à usage commercial avant validation de l'identité des comptes et des contenus publiés.
- La modération éditoriale actuelle conditionne la diffusion multiréseaux à `subscription_active?` ; la refonte de paiement reste séparée.

### Proximo

- Nouveau `PropertyListing`, rattaché à une `Organization` et à un auteur identifié.
- Brouillon immobilier distinct des `Lead` et `ClientDossier`.
- Cycle `draft → ready → archived` : **ready = prêt à être contrôlé et exporté, pas posté automatiquement**.
- Backend : `GET/POST/PATCH /api/v1/proximo/organizations/:id/property_listings`,
  `PATCH :id/prepare`, `PATCH :id/archive`, `GET :id/export?kind=csv|json` et `GET /channels`.
- Contrôle owner/manager et isolation organisation, sans possibilité d'imposer l'organisation ni l'auteur depuis le payload.
- Export CSV avec protection contre l'injection de formules et JSON portant `portal_compatible:false`.
- Frontend : route `/annonces` dans le cockpit, formulaire de brouillon, contrôle de préparation, copie manuelle et catalogues de contrats.
- **Aucune annonce n'est envoyée automatiquement à SeLoger/Logic-Immo/Leboncoin** ; aucun flux partenaire n'est activé.

**Obligations à compléter avant annonces publiques :**
- Mandat autorisant la publicité et correspondance mandat/prix.
- Honoraires TTC et partie qui les supporte ; distinction inclus/exclus lorsque nécessaire.
- DPE/GES, estimation des dépenses énergétiques et année de référence lorsque le bien est concerné.
- Informations copropriété, risques/Géorisques et éventuelles mentions locatives/charges.
- Accord sur les photographies et droits d'auteur.
- Vérifier que chaque portail partenaire accepte le format de flux réellement produit.
- **L'export CSV/JSON de la première itération n'est pas une annonce légalement complète ni un format spécifique à un portail.**

Sources officielles :
- DGCCRF : https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/professionnels-de-limmobilier-les-regles-connaitre
- DPE : https://www.service-public.fr/particuliers/vosdroits/F16096
- SeLoger Pro : https://pro-seloger.com/
- Diffuze : https://www.diffuze.fr/notre-offre

## Destinations et contraintes

| Plateforme | Cible | Mode prévu | Contrainte essentielle |
|---|---|---|---|
| Facebook Pages | FO | API OAuth | Page, droits de publication, revue Meta |
| Instagram pro | FO | API OAuth | Média HTTPS, profil éligible, permission |
| TikTok | FO | API OAuth | Média + audit de l'application pour publication publique |
| LinkedIn | FO/Proximo éditorial | API future | Version Posts API et accès Community Management |
| Pinterest | FO | API future | App + scopes, Trial limité |
| Threads | FO | API future | Connexion approuvée et formats spécifiques |
| YouTube | FO | API future | Vidéo, quota et consentement |
| Mastodon | FO | API future | Compte par instance et OAuth |
| Bluesky | FO | API future | Authentification AT Protocol |
| X | FO | API optionnelle payante | Coût à l'appel, consentement au budget |
| WordPress | FO/Proximo | Blog contrôlé / partenaire | Authentification officielle, permission de l'éditeur |
| SeLoger / Logic-Immo | Proximo | Flux sous contrat | Compte professionnel, tarif, format et droits d'agence |
| Autres portails immobiliers | Proximo | Passerelle autorisée | Conditions commerciales et contrôles juridiques |
| Blogs externes | Proximo | Proposition éditoriale | Accord de l'éditeur, ne pas poster en masse |

Références développeurs :
- TikTok : https://developers.tiktok.com/docs/en/content-posting-api-get-started
- LinkedIn : https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- Pinterest : https://developers.pinterest.com/docs/work-with-organic-content-and-users/create-boards-and-pins/
- WordPress : https://developer.wordpress.org/rest-api/reference/posts/
- X : https://developer.x.com/
- Mastodon : https://docs.joinmastodon.org/methods/statuses/

## Rentabilité — proposition, non tarification activée

- **FO fiche gratuite** pour constituer l'annuaire et attirer habitants et associations.
- **Publication à l'unité** et **Premium** selon le cahier des charges client (référence 10 € HT/unité, 49 € HT/mois Premium ; promotion de lancement séparée).
- La valeur du forfait est l'atelier, la rédaction, la modération, les variantes adaptées et les statistiques, non une prétendue « gratuité garantie » des réseaux.
- Réseaux dont l'API est payante : facturation optionnelle au réel avec plafond validé par l'utilisateur, ou activation par le client sur son propre contrat.
- **Proximo** : SaaS de pilotage + option diffusion immobilière facturée séparément par portail/prestataire ; ne pas absorber des coûts imposés par SeLoger ou un agrégateur sans accord de marge.
- Première voie commerciale : pilote avec un professionnel équipé d'un logiciel de multidiffusion, puis négociation d'une passerelle/partenariat ; ne pas créer un scrapeur des portails.

## Code ancien : ce qui a été supprimé, ce qui attend migration

**Retiré de Fenêtre Ouverte frontend :**
- Anciennes pages `admin-leads-page.tsx`, `admin-commissions-page.tsx`, `admin-immo-articles-page.tsx`, `merchant/new-lead-page.tsx`.
- Les URLs correspondantes redirigent vers des parcours existants ; suppression des cartes immobilières anciennes du tableau admin/commerçant.
- Rubrique `immo` sortie des choix de navigation/édition, mais **valeur conservée** côté types et DB pour lire les contenus historiques.

**Conservé temporairement :**
- Modèles, tables et routes API historiques liés à l'immobilier : migrations, tests, données anciennes et contrats Stripe peuvent encore en dépendre.
- Les anciennes images/sources graphiques ne sont pas effacées ; leur licence et usage seront vérifiés avant migration.
- Les anciens écrans Proximo non routés seront supprimés seulement après analyse des imports et tests, pour éviter de perdre des composants réutilisés.

**Avant suppression des modèles historiques :** inventaire de données, script de migration idempotent, tests de permissions, sauvegarde, stratégie de rollback, puis suppression des routes/colonnes dans un lot isolé.

## Validation / déploiement

- PR #4 empilée sur PR #3, elle-même empilée sur PR #2.
- Branche locale WSL/Cursor `design/refonte-2026` non accessible : **ne pas merger, rebaser sur main ni déployer** avant comparaison.
- CI/QA de la PR à consulter ; aucun test manuel de vraie publication externe ou d'intégration portail n'a été réalisé.
