import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

// Configure order-service to use local stub services
process.env.PORT = process.env.PORT || '3303';
process.env.PAYMENT_BASE_URL = 'http://localhost:3305';
process.env.INVENTORY_BASE_URL = 'http://localhost:3304';

// Start stub inventory-service
const inventoryApp = express();
inventoryApp.use(express.json());
inventoryApp.post('/stock/:id', (req, res) => {
  res.json({ bookId: req.params.id, stock: 100 + (req.body?.change || 0) });
});
const inventoryServer = inventoryApp.listen(3304);

// Start stub payment-service
const paymentApp = express();
paymentApp.use(express.json());
paymentApp.post('/pay', (req, res) => {
  const { orderId, amount, method } = req.body || {};
  if (!orderId || typeof amount !== 'number' || !method) {
    return res.status(400).json({ error: 'orderId, amount, method required' });
  }
  res.status(201).json({ transactionId: 'tx-test', orderId, amount, method, status: 'approved' });
});
const paymentServer = paymentApp.listen(3305);

// Start order-service (module starts listening on import)
await import('../src/index.js');

const base = `http://localhost:${process.env.PORT}`;

test('order-service health returns ok', async () => {
  const resp = await fetch(`${base}/health`);
  assert.equal(resp.status, 200);
  const data = await resp.json();
  assert.equal(data.status, 'ok');
});

test('create order and pay successfully via stubs', async () => {
  const create = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'u1', items: [{ bookId: 'b1', qty: 2 }], total: 49.99 })
  });
  assert.equal(create.status, 201);
  const order = await create.json();
  assert.ok(order.id);
  assert.equal(order.status, 'created');

  const pay = await fetch(`${base}/orders/${order.id}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'card' })
  });
  assert.equal(pay.status, 201);
  const paid = await pay.json();
  assert.equal(paid.order.status, 'paid');
  assert.equal(paid.payment.status, 'approved');
});

// Cleanup servers after all tests complete
test.after(() => {
  inventoryServer.close();
  paymentServer.close();
});