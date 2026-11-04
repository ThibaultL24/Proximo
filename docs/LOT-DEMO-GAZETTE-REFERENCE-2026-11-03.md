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

- **Composition sauvegardée côté serveur** via `GazetteEdition` (numéro, mois, paramètres, pages JSONB, pièces Active Storage), avec brouillon local de secours dans `localStorage`. La branche dispose d'une API de publication et d'archivage.
- Les logos, secondes photos et QR importés sont persistés après **Enregistrer sur le serveur** et retrouvés à l'ouverture du numéro. Les photos des articles sont conservées par référence Active Storage lors de la publication.
- La pagination A4 comporte un mode expérimental de répartition automatique basé sur les dimensions DOM. Les pages de continuation sont enregistrées avec leurs offsets, et l'API rejette les ruptures ou pertes de texte. La recette visuelle reste obligatoire, en particulier pour les illustrations et le résultat PDF.
- Les gabarits sont des prévisualisations : ils ne garantissent pas encore la même qualité qu'une composition PAO professionnelle.
- Les marques, visuels et coordonnées correspondent à un modèle fourni et doivent être validés par le client avant une diffusion publique.
- Les QR importés doivent être testés avec un smartphone après impression.
- Les éditions publiées et archivées deviennent consultables par les habitants via `/gazette` et `/gazette/editions/:id`. Les brouillons ne sont jamais exposés publiquement.
- Les articles d'une édition publiée sont figés en instantanés (titre, résumé, texte et image conservée), avec protection du contenu publié contre les mises à jour ; les brouillons utilisent `lock_version` pour détecter les conflits d'édition.
- Un workflow Chromium produit désormais des PDF et captures à partir d'articles fictifs avec le composant React réel. Le PDF final avec les vrais articles/images n'a pas été comparé pixel à pixel aux deux pages de référence ; validation du client toujours nécessaire.

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
2. Valider et améliorer la pagination DOM expérimentale (coupes, légendes, images et mise en page des pages de suite), puis évaluer l'extraction `GazettePage` / `GazetteBlock` pour une PAO avancée et un export PDF serveur.
3. Remplacer l'attestation de transmission du prospect par un processus réel de confirmation/information et revoir les barèmes après validation juridique.
4. Tester le parcours en Playwright pour chaque rôle, ainsi que l'isolation multi-organisations et la prévisualisation imprimée.
5. Vérifier Rails, TypeScript, ESLint, le PDF A4 réel et les ressources officielles avant déploiement.
