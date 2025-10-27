#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  echo "Copying .env.example to .env (dev defaults)."
  cp .env.example .env
fi

echo "Building and starting services..."
docker compose up --build -d

echo "Services are starting. Healthchecks may take a moment."
echo "User Service:    http://localhost:${USER_SERVICE_PORT:-3001}/health"
echo "Catalog Service: http://localhost:${CATALOG_SERVICE_PORT:-3002}/health"
