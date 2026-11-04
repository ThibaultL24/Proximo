# Démonstrations authentiques — Proximo / Fenêtre Ouverte

## Pourquoi ce lot existe
Les premières vidéos partagées avec Michel/Jean-Michel étaient des **maquettes visuelles**. Elles illustraient la direction souhaitée, pas les composants React en fonctionnement. Ce lot rapproche les interfaces de cette direction et remplace les films de maquettes par des enregistrements Chromium du **code React réellement exécuté**.

## Modifications de l'interface
- **Proximo** : barre de navigation latérale avec des liens vers les routes réellement disponibles ; cockpit avec indicateurs et dossiers récupérés depuis l'API Rails ; parcours de qualification inchangé.
- **Fenêtre Ouverte publique** : quatre entrées (Fil, Commerces, Communes, Gazette), les filtres Loisirs et Bien-être restent dans le fil et les pages correspondantes demeurent accessibles.
- **Commerçant** : accès clair à Ma fiche / Publier / Visibilité QR. Les anciens leads immobiliers restent accessibles dans un volet replié, en attendant leur extraction.
- **Jean-Michel** : le tableau de bord donne la priorité à la modération, à la rédaction et au Studio Gazette ; les modules immobiliers hérités sont conservés mais ne dominent plus l'interface.

## Captures du vrai frontend
Workflow GitHub Actions : `Capture authentic React demo videos`.

Pour chaque application :
1. Lancer Vite et ouvrir de vraies routes dans Chromium.
2. Injecter **uniquement des réponses d'API de test** (utilisateurs et données fictives). Les composants, styles, navigation, règles de rendu et interactions restent ceux du dépôt.
3. Enregistrer l'écran en WebM et tenter la conversion MP4.
4. Générer des captures PNG et des artefacts de 10 jours.
5. Faire échouer la capture si une erreur JavaScript grave ou un écran blanc apparaît.

**Ce que ces vidéos prouvent :** la composition des écrans, les parcours réels et l'ergonomie du frontend sur les données simulées.

**Ce qu'elles ne prouvent pas :** l'intégration avec une véritable base de démonstration, les données client, l'envoi d'e-mails, les paiements, la diffusion vers des réseaux sociaux, les fonctionnalités sociales non développées ou la conformité juridique des commissions.

## Recette d'intégration encore nécessaire
- Conserver `design/refonte-2026` en local : ne pas écraser les modifications WSL/Cursor non poussées.
- Rejouer les scénarios avec des utilisateurs réels de test sur les deux backends Rails, chacun dans sa base PostgreSQL, et vérifier les autorisations.
- Déployer un aperçu privé après accord, puis capturer une nouvelle version avec des comptes de démonstration hébergés.
- Pour Fenêtre Ouverte, réaliser le module commentaires/likes et corriger la tarification héritée avant de les présenter comme prêts.
- Pour Proximo, formaliser le consentement du prospect et revoir les conditions de rémunération avant toute utilisation commerciale.

## Branches
- PR Gazette n° 2 : `feat/gazette-reference-proximo-demo-2026-11-03`.
- Branche de ce lot : `feat/demo-authentic-ui-2026-11-04`, PR empilée sur la précédente.
- Aucune fusion de `main` ni modification de production par ce lot.
