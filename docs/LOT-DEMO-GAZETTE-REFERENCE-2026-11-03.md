# Lot de démonstration — Gazette fidèle au PDF et parcours Proximo

## Branches / sécurité

- Branche source : `refactor/lot1-domain-extraction`.
- Branche de travail : `feat/gazette-reference-proximo-demo-2026-11-03`.
- `main` et la version de production restent inchangées.
- La version plus récente qui peut se trouver uniquement dans WSL/Cursor (Studio Gazette à six modèles, archivage et pagination) n'a pas été inspectée ni écrasée ; toute fusion devra comparer ces implémentations.

## Gazette : référence visuelle prioritaire

Document de référence communiqué : `Gazette Octobre 2026 (2)(2).pdf`, numéro 7, deux pages A4.

- Bandeau supérieur magenta avec logo partenaire à gauche, « La Gazette de Martine et Jean-Michel » au centre et signature à droite.
- Sous-bandeau territorial rose, fond blanc, titres et intertitres rose/italique.
- Texte sur deux colonnes avec photographies intégrées (portrait du commerce page 1, article conseil page 2).
- Encadré « Bon à savoir », visuel QR facultatif, bandeau annonceur et coordonnées répétés en pied.
- Six choix de gabarit visibles dans l'atelier, avec mise en page spécifique aux gabarits portrait, pratique, reportage, couverture et pleine page photo ; agenda réutilise la grille de colonnes.
- Logos en-tête et pied, deuxième photographie et QR : import depuis les fichiers locaux, puis prévisualisation.
- Les articles proviennent de l'API de rédaction existante, non du stockage du studio.
- Export via `window.print()` avec règles A4 et conservation des couleurs.

### Limites explicites

- **Composition et sauvegarde côté navigateur uniquement** via `localStorage` ; aucune publication serveur, édition archivée ou synchronisation multi-postes dans cette branche.
- Les images téléchargées (logos / seconde photo / QR) ne sont pas persistées et doivent être réimportées après rafraîchissement.
- Les longs textes ne disposent pas encore d'une pagination typographique fiable. Contrôler systématiquement l'aperçu et le PDF exporté, en particulier les risques de débordement.
- Les gabarits sont des prévisualisations : ils ne garantissent pas encore la même qualité qu'une composition PAO professionnelle.
- Les marques, visuels et coordonnées correspondent à un modèle fourni et doivent être validés par le client avant une diffusion publique.
- Les QR importés doivent être testés avec un smartphone après impression.

## Proximo : premier parcours démontrable

- Route privée `/recommandations` depuis `/espace`.
- Sélection d'organisation, droits affichés selon l'appartenance, tableau des recommandations.
- Création d'un lead fictif avec partenaire optionnel et provenance rattachée à l'organisation.
- Workflow : reçue → qualifiée → en cours → convertie, avec refus possible sur les états actifs.
- Historique consultable (nouvelle réponse `GET /leads/:id`), statut affiché dans la liste.
- Commissions **théoriques** uniquement après conversion ; aucun paiement effectif et aucune décision sur le droit à commission.
- Test d'intégration ajouté pour le nouvel état et le rôle du membre.

### Prochaines étapes produit

1. Comparer la branche à la dernière version locale du Studio Gazette, **préserver** ses gabarits, pagination et archives s'ils sont déjà développés.
2. Ajouter `GazetteEdition`, `GazettePage` et stockage de blocs médiatiques avec versionnement, export serveur vérifié et tests de débordement.
3. Remplacer l'attestation de transmission du prospect par un processus réel de confirmation/information et revoir les barèmes après validation juridique.
4. Tester le parcours en Playwright pour chaque rôle, ainsi que l'isolation multi-organisations et la prévisualisation imprimée.
5. Vérifier Rails, TypeScript, ESLint, le PDF A4 réel et les ressources officielles avant déploiement.
