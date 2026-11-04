#!/usr/bin/env bash
# Comparaison non destructive : ne touche ni à HEAD, ni à l'index, ni aux fichiers locaux.
set -euo pipefail

local_branch="${LOCAL_BRANCH:-design/refonte-2026}"
pr_branch="${PR_BRANCH:-feat/gazette-reference-proximo-demo-2026-11-03}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Exécutez depuis le clone qui contient le Studio Gazette."
  exit 1
fi
if ! git show-ref --verify --quiet "refs/heads/$local_branch"; then
  echo "Branche locale absente : $local_branch"
  echo "Localisez d'abord votre dépôt WSL/Cursor, sans fusionner de branches."
  exit 2
fi
if ! git show-ref --verify --quiet "refs/remotes/origin/$pr_branch"; then
  echo "La référence distante origin/$pr_branch est absente."
  echo "Pour la récupérer sans changer de branche :"
  echo "git fetch origin \"$pr_branch:refs/remotes/origin/$pr_branch\""
  exit 3
fi

echo "=== Audit non destructif des branches ==="
echo "Local : $local_branch ($(git rev-parse --short "$local_branch"))"
echo "PR    : origin/$pr_branch ($(git rev-parse --short "origin/$pr_branch"))"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Modifications non commitées détectées :"
  git status --short
fi

echo "=== Diff des zones Gazette ==="
git diff --name-status "$local_branch" "origin/$pr_branch" -- \
  apps/fenetre-ouverte/frontend/src/pages/admin \
  apps/fenetre-ouverte/frontend/src/components/gazette \
  apps/fenetre-ouverte/frontend/src/pages/public/gazette-editions-page.tsx \
  apps/fenetre-ouverte/frontend/src/api/gazette-editions.ts \
  apps/fenetre-ouverte/backend/app/models/gazette_edition.rb \
  apps/fenetre-ouverte/backend/app/controllers/api/v1/admin/gazette_editions_controller.rb \
  apps/fenetre-ouverte/backend/db/migrate \
  docs

echo "=== Fonctionnalités Gazette repérées en local ==="
git ls-tree -r --name-only "$local_branch" | grep -Ei 'gazette|pagination|edition|snapshot' || true
echo "=== Fonctionnalités Gazette repérées sur la PR ==="
git ls-tree -r --name-only "origin/$pr_branch" | grep -Ei 'gazette|pagination|edition|snapshot' || true

echo "Aucun merge/cherry-pick/checkout/stash n'a été effectué."
echo "Comparer migrations, versions, gabarits, pagination et snapshots avant intégration."
