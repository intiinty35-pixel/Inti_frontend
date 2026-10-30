#!/usr/bin/env sh
# Despliegue rapido del frontend: sh deploy/deploy.sh
# Requiere ../.env (copiar de .env.example) con las variables NEXT_PUBLIC_* de Firebase.
set -e
cd "$(dirname "$0")"
[ -f ../.env ] || { echo "Falta ../.env (copiar de .env.example)"; exit 1; }
git pull --ff-only
docker network inspect inti-net >/dev/null 2>&1 || docker network create inti-net
docker compose --env-file ../.env up -d --build
docker image prune -f >/dev/null
# Libera cache de build con mas de 24 h (mantiene la reciente para builds rapidos)
docker builder prune -f --filter "until=24h" >/dev/null
docker compose logs --tail=15 frontend
