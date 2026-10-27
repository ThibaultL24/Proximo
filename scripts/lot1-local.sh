#!/usr/bin/env bash
# Preview the two isolated Lot 1 applications in WSL/Linux. No deployment.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMAND="${1:-help}"

# These credentials are only for local Docker Compose containers.
export RAILS_ENV=development
export LOT1_SKIP_REMOTE_ASSETS=1
export FENETRE_OUVERTE_DATABASE_URL="${FENETRE_OUVERTE_DATABASE_URL:-postgresql://lot1:lot1-local-only@127.0.0.1:55432/fenetre_ouverte_development}"
export PROXIMO_DATABASE_URL="${PROXIMO_DATABASE_URL:-postgresql://lot1:lot1-local-only@127.0.0.1:55433/proximo_development}"
export FENETRE_OUVERTE_JWT_SECRET="${FENETRE_OUVERTE_JWT_SECRET:-local-demo-fo-jwt-secret-not-for-production}"
export PROXIMO_JWT_SECRET="${PROXIMO_JWT_SECRET:-local-demo-proximo-jwt-secret-not-for-production}"

compose() { docker compose -f "$ROOT/compose.lot1.local.yml" "$@"; }

backend() {
  local app="$1"
  shift
  (
    cd "$ROOT/apps/$app/backend"
    if [[ "$app" == "fenetre-ouverte" ]]; then
      export FRONTEND_URL="http://localhost:5173"
      export FRONTEND_ORIGIN="http://localhost:5173"
      export BACKEND_URL="http://127.0.0.1:3200"
      export PORT=3200
    else
      export FRONTEND_URL="http://localhost:5174"
      export FRONTEND_ORIGIN="http://localhost:5174"
      export BACKEND_URL="http://127.0.0.1:3100"
      export PORT=3100
    fi
    "$@"
  )
}

frontend() {
  local app="$1"
  shift
  (
    cd "$ROOT/apps/$app/frontend"
    "$@"
  )
}

case "$COMMAND" in
  setup)
    for tool in docker bundle npm; do
      command -v "$tool" >/dev/null || { echo "Commande manquante: $tool" >&2; exit 1; }
    done
    compose up -d --wait

    echo "Preparing Fenetre Ouverte (3200 / 5173)..."
    backend fenetre-ouverte bundle check || backend fenetre-ouverte bundle install
    backend fenetre-ouverte bin/rails db:prepare
    backend fenetre-ouverte bin/rails db:seed
    frontend fenetre-ouverte npm ci

    echo "Preparing Proximo (3100 / 5174)..."
    backend proximo bundle check || backend proximo bundle install
    backend proximo bin/rails db:prepare
    backend proximo bin/rails db:seed
    export PROXIMO_CONFIRM_LEGACY_BACKFILL=1
    backend proximo bin/rails proximo:backfill_legacy
    frontend proximo npm ci

    echo ""
    echo "Ready. Open four terminals and run:"
    echo "  ./scripts/lot1-local.sh fo-api"
    echo "  ./scripts/lot1-local.sh fo-ui"
    echo "  ./scripts/lot1-local.sh proximo-api"
    echo "  ./scripts/lot1-local.sh proximo-ui"
    ;;
  fo-api)
    backend fenetre-ouverte bin/rails server -b 127.0.0.1
    ;;
  proximo-api)
    backend proximo bin/rails server -b 127.0.0.1
    ;;
  fo-ui)
    frontend fenetre-ouverte npm run dev -- --host 127.0.0.1
    ;;
  proximo-ui)
    frontend proximo npm run dev -- --host 127.0.0.1
    ;;
  status)
    echo "Fenetre Ouverte: http://localhost:5173 (API http://localhost:3200/api/v1/health)"
    echo "Proximo:         http://localhost:5174 (API http://localhost:3100/api/v1/health)"
    echo "Territory API:   http://localhost:3200/api/v1/territories/fenetre-ouverte/articles"
    compose ps
    ;;
  stop)
    compose down
    ;;
  help|-h|--help)
    cat <<'HELP'
Lot 1 local preview:
  ./scripts/lot1-local.sh setup
  ./scripts/lot1-local.sh fo-api        # terminal 1
  ./scripts/lot1-local.sh fo-ui         # terminal 2
  ./scripts/lot1-local.sh proximo-api   # terminal 3
  ./scripts/lot1-local.sh proximo-ui    # terminal 4
  ./scripts/lot1-local.sh status
  ./scripts/lot1-local.sh stop

To erase BOTH local demo databases (irreversible):
  docker compose -f compose.lot1.local.yml down -v
HELP
    ;;
  *)
    echo "Unknown command: $COMMAND" >&2
    exit 2
    ;;
esac
