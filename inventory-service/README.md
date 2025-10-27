# Inventory Service (Go)

## Endpoints
- `GET /health` — service health.
- `GET /stock/{bookId}` — get current stock for a book.
- `POST /stock/{bookId}` — update stock with body: { change }.

## Local dev
1. Install go 1.22+
2. `go run .`

## Notes
- In-memory store for demo purposes.