# Order Service

The order-service handles order creation, status updates, and integrates with inventory-service and payment-service.

## Endpoints

- `GET /health` – service health check
- `POST /orders` – create an order
  - Request: `{ userId, items: [{ bookId, qty }], total }`
  - Behavior: Creates order and best-effort decrements stock by calling inventory-service `POST /stock/{bookId}` with `{ change: -qty }`.
- `GET /orders/:id` – fetch order by id
- `PUT /orders/:id/status` – update order status
- `POST /orders/:id/pay` – pay for an order
  - Calls payment-service `POST /pay` with `{ orderId, amount, method }`, sets status to `paid` on success.

## Configuration

Environment variables:
- `PORT` (default `3003`)
- `PAYMENT_BASE_URL` (default `http://payment-service:3005`)
- `INVENTORY_BASE_URL` (default `http://inventory-service:3004`)

## Notes

- This service uses an in-memory map for orders for demonstration.
- Inventory updates are best-effort; failures are logged but do not block order creation.