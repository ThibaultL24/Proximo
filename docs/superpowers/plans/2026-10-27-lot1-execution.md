# Lot 1 — Exécution contrôlée de la séparation (27 octobre 2026)

## Base et invariants

- Source : commit `fa20cd5411f0efb8b2d316d31e86d34a38c0fa7c` de `main` (18 août 2026).
- Monolithe historique conservé en place ; boutique gelée, ni déplacée ni enrichie.
- Proximo : `Organization`, `Membership`, `Partner`, `Lead`, `Commission`.
- Fenêtre Ouverte : `Territory`, `Merchant`, `Article`, `Publication`, `QR`.
- `Agency` supprimée des deux applications à la fin du lot, jamais avant migration des dépendances.
- `Lead` sans `merchant_id` ; `Merchant` sans leads ni produits.
- Deux bases PostgreSQL, sans table partagée, migration ou authentification croisée.
- JWT : secrets, `iss`, `aud` propres à chaque API. Vérifier le refus de jetons croisés, même si les secrets de test sont identiques.

## Ordre opératoire (arrêts de revue)

### Tâche 1 : snapshot et copies

- [x] Préserver `backend/` et `frontend/`.
- [x] Dupliquer les répertoires dans `apps/proximo/` et `apps/fenetre-ouverte/`.
- [ ] Vérifier la compilation et les tests des copies ; **aucun déploiement**.

### Tâche 2 : socles indépendants

- [x] Configuration PostgreSQL distincte par application en dev/test/prod (tests CI à confirmer).
- [x] Ports Rails `3100` et `3200`, Vite `5174` et `5173`.
- [x] JWT avec `iss/aud` et secrets propres, tests positifs et négatifs (exécution CI à confirmer).
- [x] Configurations distinctes et secrets explicites obligatoires en production.

### Tâche 3 : Proximo, isolation des organisations — ARRÊT OBLIGATOIRE

- [x] Introduire `Organization`, `Membership`, `Partner` (migrations contraintes, FK, index) — tests CI encore à confirmer.
- [x] Migration progressive : les anciennes agences, leurs administrateurs, commerçants et prospects sont rattachés aux nouvelles organisations / partenaires. Réexécution idempotente vérifiée par test CI à confirmer.
- [ ] Tests de base ajoutés sur les nouveaux endpoints avec deux organisations fictives (lecture, mutation, accès ID direct et rôles). Reste : exécution CI et audit des parcours hérités / tableaux de bord.
- [ ] Accès directs inter-agences corrigés dans les anciens contrôleurs admin (leads, commissions, checkout). Reste : revue complète des contrôleurs, politiques, services, serializers.

### Tâche 4 : routes et métier Proximo

- [ ] Nouveaux leads Proximo indépendants des commerçants sur endpoints dédiés (création/lecture). Reste : migration des anciens parcours de statut, commission, suppression des colonnes legacy.
- [ ] API immobilière indépendante créée : leads, qualification, rejet, conversion, commissions en lecture, contrôle des rôles. Restent l'UI spécialisée, le paiement et la facturation Stripe.

### Tâche 5 : Fenêtre Ouverte, isolation des territoires — ARRÊT OBLIGATOIRE

- [ ] `Territory` et contrôles de portée.
- [ ] Deux territoires fictifs, accès direct interdit hors périmètre.
- [ ] Conserver Gazette, fiches, publications, QR et fonction sociale.

### Tâches 6 et 7 : nettoyage, vérification

- [ ] Supprimer `Agency` et les dépendances étrangères à chacun des domaines.
- [ ] Préserver la boutique dans le monolithe gelé uniquement.
- [ ] Exécuter tests API, intégration, build front et sécurité ; démontrer que chaque API refuse le JWT de l'autre.
- [ ] Préparer une migration des données **sans réutiliser directement la base en production**.

## Conditions de fin

Deux backends Rails indépendants répondent sur `:3100` et `:3200`, avec deux bases PostgreSQL et des JWT incompatibles. Les deux frontières métier et les tests d'isolation sont validés. Jusqu'à cette preuve, il s'agit d'une branche d'extraction, pas d'un remplacement prêt à livrer.
