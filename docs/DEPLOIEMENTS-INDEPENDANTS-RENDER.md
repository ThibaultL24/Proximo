# Déploiement indépendant — Proximo et Fenêtre Ouverte

## Statut et sécurité

Ces fichiers **préparent** une infrastructure séparée. Le Blueprint `render.independent.yaml` n'est **pas** appliqué automatiquement : les instances Postgres déclarées sont payantes. Le `render.yaml` historique reste inchangé afin de préserver le service en ligne jusqu'à validation du nouveau parcours.

Deux services sont prévus, **un par produit**, chacun servant depuis la même origine HTTP sa SPA React et son API Rails :

| Produit | Dockerfile autonome | Base | JWT |
| --- | --- | --- | --- |
| Proximo | `apps/proximo/Dockerfile` | `PROXIMO_DATABASE_URL` | `PROXIMO_JWT_SECRET` |
| Fenêtre Ouverte | `apps/fenetre-ouverte/Dockerfile` | `FENETRE_OUVERTE_DATABASE_URL` | `FENETRE_OUVERTE_JWT_SECRET` |

Chaque image compile le Vite React correspondant et copie le résultat dans le répertoire public de son Rails, qui fournit déjà `SpaController` et `GET /api/v1/health`. Les appels API utilisent le même domaine par défaut (`VITE_API_URL` vide), donc aucun partage de cookies, de jeton ou de base entre les produits.

## Protections et validation

- Les scripts d'entrée exécutent **uniquement** `rails db:migrate` en production. **Ne jamais exécuter `db:prepare` ni `db:seed` au premier démarrage** : les seeds historiques contiennent des comptes de démonstration et des mots de passe prédictibles.
- Les secrets `SECRET_KEY_BASE` et `*_JWT_SECRET` doivent être uniques, aléatoires et persistants, générés dans Render. Ne jamais les pousser sur GitHub.
- Rails a `force_ssl = true`. Render termine HTTPS et relaie les en-têtes proxy.
- Aucune modification de l'ancien `Dockerfile`, de `render.yaml`, de `fly.toml` ni de `frontend/vercel.json` à la racine.
- Les builds Docker des deux produits et le démarrage réel Rails avec PostgreSQL de CI sont contrôlés par `.github/workflows/independent-deploy-smoke.yml`.
- La branche locale WSL `design/refonte-2026` non poussée n'est pas touchée par ces modifications GitHub.

## Créer les ressources dans Render (uniquement après accord)

1. Choisir explicitement l'espace Render `fenêtre ouverte` (confirmer l'ID de workspace dans l'interface).
2. Confirmer le coût de deux bases **distinctes**. Render autorise au maximum **une base Postgres gratuite par workspace**, avec expiration à 30 jours. Les deux bases durables du Blueprint ont le plan `0.1c-256mb` (au moment de rédaction : **6 $/mois par base**, 1 Go inclus). Prévoir au minimum **12 $/mois** pour les deux bases, hors croissance stockage.
3. Créer les deux bases en région `frankfurt` et vérifier leur nom.
4. Créer deux services web Docker sur **le même dépôt** `https://github.com/ThibaultL24/Proximo`, branche `main`, en indiquant :
   - Proximo : Dockerfile `./apps/proximo/Dockerfile`, contexte `.`
   - Fenêtre Ouverte : Dockerfile `./apps/fenetre-ouverte/Dockerfile`, contexte `.`
   - `autoDeploy: false` pour le premier déploiement, plan `free` uniquement pour *prévisualisation sans données réelles*.
5. Injecter les variables déclarées dans `render.independent.yaml`, et les URL internes des **bonnes** bases seulement. Ne pas copier les secrets JWT ou les données du monolithe.
6. Contrôler `/up`, `/api/v1/health`, `/`, puis la navigation directe vers des routes React et les règles d'authentification.
7. Tester les flux d'inscription et les APIs avec des **comptes dédiés de prévisualisation** créés par les parcours autorisés, sans import de données clients.
8. **Après** validation et sauvegardes, planifier la migration du contenu réel et les DNS.

## Dépenses et limites importantes

- L'offre web `free` de Render (512 Mo RAM) passe en veille après 15 minutes d'inactivité et perd les fichiers locaux après redémarrage. Les deux services consomment un quota d'heures gratuit commun.
- Pour des services permanents, la configuration Render doit être portée sur un plan web payant. Prix indicatif Starter : **7 $/mois par service**, soit environ **26 $/mois** au total pour deux services toujours allumés et deux bases de première gamme, **hors stockage supplémentaire**.
- Les deux Rails sont encore configurés en `ActiveStorage :local`. **Ne pas téléverser de photos, documents clients ou éditions Gazette importants sur un service web éphémère.** Un stockage objet durable (S3/R2) ou un disque persistant propre à chaque application doit être provisionné et testé avant usage réel.
- Le connecteur WordPress existe, mais les tâches asynchrones Rails ne disposent pas encore d'un worker persistant configuré et supervisé dans cette topologie. **Ne pas activer la multidiffusion réelle avant une file de jobs durable.**
- Les bases neuves seront vides : l'ancien site, ses clients et ses contenus **ne sont pas transférés automatiquement**. La migration de données requiert une opération distincte et une sauvegarde préalable.
- Les comptes Meta, TikTok, Stripe, WordPress et les portails immobiliers doivent être configurés séparément. Pas de secret partagé ou de publication automatique sans autorisation.
- Les bases Postgres Render payantes sont facturées dès leur création. Ne pas les créer sans validation de budget.

## Recette attendue

- `curl -I https://<proximo-host>/up` : 200
- `GET https://<proximo-host>/api/v1/health` : `app: "Proximo API"`
- `GET https://<fenetre-host>/api/v1/health` : `app: "Fenêtre Ouverte API"`
- Routes SPA `/espace`, `/annonces` et `/gazette` accessibles dans la bonne app
- `PROXIMO_JWT_SECRET` / `FENETRE_OUVERTE_JWT_SECRET` distincts, jetons inter-produits refusés
- Aucune migration/écriture sur la base existante du monolithe
- Aucun compte `super@fenetreouverte.fr` / `admin@fenetreouverte.fr` de démonstration créé automatiquement
- Aucune seed de démonstration, facturation, publication sociale ni envoi immobilier activés sans consentement

## Références

- Render : https://render.com/docs/blueprint-spec
- Render gratuit : https://render.com/docs/free
- Tarifs : https://render.com/pricing
- GitHub Actions : `.github/workflows/independent-deploy-smoke.yml`
