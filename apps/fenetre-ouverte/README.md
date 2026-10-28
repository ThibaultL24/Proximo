# Fenêtre Ouverte — copie de travail du Lot 1

**Ne pas déployer.** Cette application est une copie du monolithe historique et contient encore du code de l'autre domaine.

- API Rails : `http://localhost:3200`
- Frontend Vite : `http://localhost:5173`
- Base de développement : `fenetre_ouverte_development` (PostgreSQL)
- Base de test : `fenetre_ouverte_test` (PostgreSQL)
- Variable de base : `FENETRE_OUVERTE_DATABASE_URL` (`FENETRE_OUVERTE_TEST_DATABASE_URL` en test)
- Secret JWT : `FENETRE_OUVERTE_JWT_SECRET`, **obligatoire en production** et différent de l'autre API
- JWT : `iss=fenetre-ouverte`, `aud=fenetre-ouverte-api`

Depuis `backend/` : `bundle install`, `bin/rails db:prepare`, `bin/rails server`.
Depuis `frontend/` : `npm ci`, `npm run dev`.

Le test `backend/test/services/json_web_token_test.rb` refuse les jetons croisés et expirés. L'isolation complète par organisation / territoire est une étape ultérieure et exige une validation distincte.
