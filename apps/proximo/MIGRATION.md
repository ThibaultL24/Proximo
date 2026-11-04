# Migrer progressivement des données vers Proximo

Cette procédure s'applique **uniquement à une copie isolée** de l'ancienne base, jamais à la base live de Fenêtre Ouverte.

1. Sauvegarder la base source et confirmer sa restauration possible. Ne pas réutiliser le même `DATABASE_URL`.
2. Importer les données héritées dans l'environnement Proximo dédié, avant d'exécuter les migrations de domaine.
3. Exécuter `RAILS_ENV=development bin/rails db:migrate` sur la copie.
4. Si les données de démonstration ont été générées **après** les migrations, exécuter explicitement :

```sh
PROXIMO_CONFIRM_LEGACY_BACKFILL=1 bin/rails proximo:backfill_legacy
```

5. Contrôler le nombre d'agences vs organisations rattachées, de commerçants vs partenaires importés, et de prospects associés. Vérifier également les profils utilisateurs et les rôles.

Le backfill est idempotent : une seconde exécution ne crée pas de doublons sur les identifiants historiques. Les prospects exclusivement Proximo ne reçoivent **jamais** d'`agency_id` ni de `merchant_id`.

## Limites à résoudre avant mise en production

- Les tables `Agency` et `Merchant` subsistent encore dans la copie Proximo et continuent d'être utilisées par des routes et composants hérités.
- Les migrations ne constituent pas un système de synchronisation entre les services : aucune lecture de la base FO n'est effectuée à l'exécution.
- Aucun paiement Stripe n'est déclenché par l'API de commissions Proximo actuelle. Les commissions y sont consultables, pas encaissables.
- Il faut une stratégie de transfert des données et des fichiers Active Storage, des clés et des comptes Stripe avant toute bascule.
- Les seuls comptes qui reçoivent automatiquement une appartenance propriétaire à l'organisation sont les anciens administrateurs associés à une agence.
