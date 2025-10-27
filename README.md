# Online Bookstore — Microservices (DevOps Activity)

This repository contains a minimal, production-style microservices setup for an online bookstore. Each service is independent, owns its domain, and ships with its own CI/CD pipeline.

- `user-service` — Node.js + Express + MySQL (user registration, login, profile).
- `catalog-service` — Go + MongoDB (book catalog CRUD).
- `order-service` — Node.js + Express (create/get/update order status).
- `inventory-service` — Go (stock query and updates).
- `payment-service` — Node.js + Express (process payments; stubbed approval).

## Quick Start (Local with Docker Compose)

1. Copy `.env.example` to `.env` and update secrets if desired:
   ```bash
   cp .env.example .env
   ```

2. Build & run:
   ```bash
   docker compose up --build -d
   ```

3. Verify health endpoints:
   - User Service:     http://localhost:3001/health
   - Catalog Service:  http://localhost:3002/health
   - Order Service:    http://localhost:3003/health
   - Inventory Service:http://localhost:3004/health
   - Payment Service:  http://localhost:3005/health

4. Run tests inside each service (or via GitHub Actions per-service):
   - Node services: `npm test`
   - Go services: `go test ./...`

## Services

- `user-service/` — Express app with JWT auth and bcrypt password hashing. Uses MySQL.
- `catalog-service/` — Go HTTP API. Uses MongoDB (credentials via compose env). Endpoints: `/health`, `/books` (GET/POST), `/books/{id}` (PUT/DELETE).
- `order-service/` — Express API with in-memory store. Endpoints: `/health`, `/orders` (POST), `/orders/:id` (GET), `/orders/:id/status` (PUT).
- `inventory-service/` — Go API with in-memory stock. Endpoints: `/health`, `/stock/{bookId}` (GET/POST with `{ change }`).
- `payment-service/` — Express API with stub payment. Endpoints: `/health`, `/pay` (POST `{ orderId, amount, method }`).

## CI/CD (Per-Service Repos)

Each microservice has its own `.github/workflows/ci-cd.yml`:
- CI: install/build/test and Docker image build.
- CD: stub job for a self-hosted runner to run `docker compose pull && docker compose up -d --build`.

Tip: Push each folder to separate GitHub repositories to achieve independent pipelines.

## Deploy Script

For local or server deployment:
```bash
./scripts/deploy.sh
```
This builds images and starts services via Docker Compose.

## Folder Structure

```
bookstore-microservices/
├─ user-service/
├─ catalog-service/
├─ order-service/
├─ inventory-service/
├─ payment-service/
├─ docs/
├─ scripts/
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

