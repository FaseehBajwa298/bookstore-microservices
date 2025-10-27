# Assumptions & Notes

- **Tech Choices** per rubric:
  - User Service: Node.js + Express, Relational DB **MySQL** via Docker.
  - Catalog Service: **Go** HTTP API, NoSQL **MongoDB** via Docker.
- Security:
  - JWT secret and DB passwords are **dev defaults**; replace in `.env` for real use.
- Tests:
  - Lightweight unit tests (no DB dependency) + basic handlers tests.
- CD:
  - GitHub-hosted runners cannot run privileged Docker-in-Docker easily for compose-based deploys,
    so the CD job is stubbed to run on a **self-hosted** runner. Local deploy via `./scripts/deploy.sh`.
- You can add more services (e.g., Orders, Payments) later. 
