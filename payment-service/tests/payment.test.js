import test from 'node:test';
import assert from 'node:assert/strict';

process.env.PORT = process.env.PORT || '3405';
const { server } = await import('../src/index.js');
const base = `http://localhost:${process.env.PORT}`;

test('payment-service health returns ok', async () => {
  const resp = await fetch(`${base}/health`);
  assert.equal(resp.status, 200);
  const data = await resp.json();
  assert.equal(data.status, 'ok');
});

test('pay returns 400 on missing fields', async () => {
  const resp = await fetch(`${base}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  assert.equal(resp.status, 400);
});

test('pay returns 201 on valid input', async () => {
  const resp = await fetch(`${base}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: 'o1', amount: 10.5, method: 'card' }) });
  assert.equal(resp.status, 201);
  const data = await resp.json();
  assert.equal(data.status, 'approved');
  assert.ok(data.transactionId);
});

// Cleanup server after all tests complete
test.after(() => {
  server.close();
});