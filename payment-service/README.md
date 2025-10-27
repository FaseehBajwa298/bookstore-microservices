# Payment Service (Node.js + Express)

## Endpoints
- `GET /health` — service health.
- `POST /pay` — process a payment: { orderId, amount, method } → { transactionId, status }.

## Local dev
1. `npm i`
2. `npm start`

## Notes
- Stub approval logic; integrate with provider later.