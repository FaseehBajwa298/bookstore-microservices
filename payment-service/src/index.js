import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.PORT || 3005;
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

// Process a payment: { orderId, amount, method }
app.post('/pay', (req, res) => {
  const { orderId, amount, method } = req.body || {};
  if (!orderId || typeof amount !== 'number' || !method) {
    return res.status(400).json({ error: 'orderId, amount, method required' });
  }
  // Stub payment approval
  const txId = uuidv4();
  res.status(201).json({ transactionId: txId, orderId, amount, method, status: 'approved' });
});

app.listen(PORT, () => {
  console.log(`payment-service listening on :${PORT}`);
});