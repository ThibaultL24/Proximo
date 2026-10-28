#!/usr/bin/env bash
# Launch both Vite frontends for a fast side-by-side design preview.
# Rails APIs and PostgreSQL are NOT required. Dynamic content may be empty.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v npm >/dev/null || { echo "npm / Node.js manquant" >&2; exit 1; }

for app in fenetre-ouverte proximo; do
  path="$ROOT/apps/$app/frontend"
  if [[ ! -d "$path/node_modules" ]]; then
    echo "Installing local dependencies for $app..."
    (cd "$path" && npm ci)
  fi
done

pids=()
cleanup() {
  trap - EXIT INT TERM
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo
echo "Comparaison des NOUVELLES interfaces (branche refactor/lot1-domain-extraction) :"
echo "  Fenetre Ouverte : http://localhost:5173"
echo "  Proximo         : http://localhost:5174"
echo "Sans Rails, certaines donnees et pages connectees restent indisponibles."
echo "CTRL+C pour fermer."
echo

(cd "$ROOT/apps/fenetre-ouverte/frontend" && npm run dev -- --host 127.0.0.1) &
pids+=("$!")
(cd "$ROOT/apps/proximo/frontend" && npm run dev -- --host 127.0.0.1) &
pids+=("$!")
wait -n "${pids[@]}"
