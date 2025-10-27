import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.PORT || 3003;
const PAYMENT_BASE_URL = process.env.PAYMENT_BASE_URL || 'http://payment-service:3005';
const INVENTORY_BASE_URL = process.env.INVENTORY_BASE_URL || 'http://inventory-service:3004';

const app = express();
app.use(express.json());

// In-memory orders store for demo purposes
const orders = new Map();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

// Create an order: { userId, items: [{ bookId, qty }], total }
app.post('/orders', async (req, res) => {
  const { userId, items, total } = req.body || {};
  if (!userId || !Array.isArray(items) || typeof total !== 'number') {
    return res.status(400).json({ error: 'userId, items[], total required' });
  }
  const id = uuidv4();
  const order = { id, userId, items, total, status: 'created', createdAt: new Date().toISOString() };
  orders.set(id, order);

  // Decrease stock for each item (best-effort demo)
  try {
    await Promise.all(items.map((it) =>
      fetch(`${INVENTORY_BASE_URL}/stock/${encodeURIComponent(it.bookId)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ change: -Math.abs(it.qty || 0) }) })
    ));
  } catch (e) {
    // keep order created; in real system consider saga/compensation
    console.warn('inventory update failed:', e?.message || e);
  }

  res.status(201).json(order);
});

// Get an order by id
app.get('/orders/:id', (req, res) => {
  const id = req.params.id;
  if (!orders.has(id)) return res.status(404).json({ error: 'order not found' });
  res.json(orders.get(id));
});

// Update order status
app.put('/orders/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body || {};
  if (!orders.has(id)) return res.status(404).json({ error: 'order not found' });
  if (!status) return res.status(400).json({ error: 'status required' });
  const o = orders.get(id);
  o.status = status;
  orders.set(id, o);
  res.json(o);
});

// Pay for an order by calling payment-service
app.post('/orders/:id/pay', async (req, res) => {
  const id = req.params.id;
  const { method } = req.body || {};
  if (!orders.has(id)) return res.status(404).json({ error: 'order not found' });
  const o = orders.get(id);
  try {
    const resp = await fetch(`${PAYMENT_BASE_URL}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: id, amount: o.total, method: method || 'card' })
    });
    const data = await resp.json().catch(() => ({ error: 'invalid response from payment-service' }));
    if (!resp.ok) return res.status(resp.status).json(data);
    o.status = 'paid';
    orders.set(id, o);
    return res.status(201).json({ order: o, payment: data });
  } catch (e) {
    return res.status(502).json({ error: 'payment service unavailable', details: e?.message || String(e) });
  }
});

const server = app.listen(PORT, () => {
  console.log(`order-service listening on :${PORT}`);
});

export { server };