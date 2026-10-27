# Extraction des domaines — Lot 1

Cette branche prépare la séparation du monolithe historique `backend/` + `frontend/` en deux applications indépendantes :

- `apps/proximo/` : futur SaaS immobilier multi-organisations ;
- `apps/fenetre-ouverte/` : média local, commerçants et Gazette territoriale.

Le **monolithe de référence reste dans `backend/` et `frontend/`**, volontairement inchangé. La boutique demeure gelée dans cette source. Les copies initiales héritent provisoirement du code métier commun : **ne pas les déployer en production avant l'extraction et la revue**.

## Jalons

1. [x] Dupliquer la base historique sans modifier la version en ligne.
2. [ ] Préparer les services indépendants (ports, bases PostgreSQL, JWT distincts).
3. [ ] Créer Organization / Membership / Partner dans Proximo et prouver l'isolation de deux organisations fictives.
4. [ ] Extraire les parcours immobiliers, supprimer les liens marchand / prospect.
5. [ ] Créer Territory dans Fenêtre Ouverte et vérifier l'isolation de deux territoires fictifs.
6. [ ] Retirer les modèles, routes, services et écrans étrangers à chaque métier.
7. [ ] Valider deux API (3100 / 3200), deux bases, des jetons incompatibles et les parcours utilisateur.

Les étapes 3 et 5 comportent des revues obligatoires. Ne pas remplacer le monolithe déployé avant validation de bout en bout.

Voir `docs/superpowers/plans/2026-10-27-lot1-execution.md`.
