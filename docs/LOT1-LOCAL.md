# Prévisualisation locale — Lot 1 (WSL2 / Linux)

**Ce document ne décrit pas un déploiement.** Le site du client existant n'est pas modifié et la PR demeure en brouillon. Lancez les deux copies en local pour examiner les parcours avant toute décision de fusion.

## Prérequis

- WSL2 Ubuntu récent, Docker Desktop + intégration WSL2 (ou Docker Engine + Compose v2).
- Ruby 3.4.x, Bundler, Node.js >= 22.12, npm.
- Bibliothèques natives Rails : `sudo apt-get install -y build-essential libpq-dev libvips-dev`.
- Ports disponibles : 5173, 5174, 3100, 3200, 55432, 55433.

**N'utilisez jamais des données, secrets ou URL de production.** Les identifiants Docker du Compose sont volontairement destinés à la démonstration locale.

## Démarrage

Dans un dossier séparé de votre checkout habituel, pour ne pas toucher à un travail non commité :

```bash
git clone --branch refactor/lot1-domain-extraction --single-branch \
  https://github.com/ThibaultL24/Proximo.git fenetre-ouverte-lot1
cd fenetre-ouverte-lot1

bash scripts/lot1-local.sh setup
```

Puis ouvrez **quatre terminaux WSL** dans le même dossier et lancez, un par terminal :

```bash
bash scripts/lot1-local.sh fo-api
bash scripts/lot1-local.sh fo-ui
bash scripts/lot1-local.sh proximo-api
bash scripts/lot1-local.sh proximo-ui
```

La configuration est faite pour démarrer les deux bases PostgreSQL en conteneurs indépendants, les deux API Rails en local, et les deux clients Vite, sans polluer les variables d'environnement persistantes de WSL.

| Application | Interface | API |
| --- | --- | --- |
| Fenêtre Ouverte | http://localhost:5173 | http://localhost:3200 |
| Proximo | http://localhost:5174 | http://localhost:3100 |

Exemples de nouveaux endpoints :

- http://localhost:3200/api/v1/territories/fenetre-ouverte/articles
- http://localhost:3200/api/v1/territories/fenetre-ouverte/merchants
- http://localhost:3100/api/v1/proximo/organizations (authentification requise)

Les seeds créent des comptes **fictifs** (`admin@fenetreouverte.fr / password123`). Les téléchargements d'images distantes sont désactivés pour accélérer la préparation locale ; l'apparence peut être moins riche qu'en production.

## Ce que vous verrez réellement

- Fenêtre Ouverte conserve largement l'interface de son prototype, en attendant la refonte éditoriale et la séparation complète des fonctionnalités immobilières.
- Proximo possède des tables et routes immobilières indépendantes **mais son frontend est toujours une copie transitoire** du prototype Fenêtre Ouverte, avec un nom changé. Il ne faut donc pas interpréter l'interface actuelle de Proximo comme la future identité produit.
- La boutique, ainsi que de nombreuses anciennes routes, restent présentes dans les copies en attendant leur nettoyage. Ne déployez pas.

Arrêter les conteneurs : `bash scripts/lot1-local.sh stop`. Les données locales persistent par défaut. Pour les détruire : `docker compose -f compose.lot1.local.yml down -v`.

## Avant de pousser vers `main`

Valider la séparation complète : anciens modèles, accès utilisateurs, routes, revues éditoriales, commissions et paiement, migrations de données et fichiers. La PR #1 reste en brouillon tant que ces points ne sont pas vérifiés.
