import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db.js';
import { v4 as uuidv4 } from 'uuid';

describe('Expenses API Integration Tests', () => {
  beforeAll(() => {
    // Clean tables before tests
    db.exec('DELETE FROM idempotency_keys; DELETE FROM expenses;');
  });

  afterAll(() => {
    db.close();
  });

  const validExpense = {
    amount: "250.00",
    category: "Food",
    description: "Lunch",
    date: "2026-04-28"
  };

  describe('POST /expenses', () => {
    it('should create a new expense with valid data and idempotency key', async () => {
      const key = uuidv4();
      const res = await request(app)
        .post('/expenses')
        .set('Idempotency-Key', key)
        .send(validExpense);

      expect(res.status).toBe(201);
      expect(res.body.id).toMatch(/^exp_/);
      expect(res.body.amount).toBe("250.00");
      expect(res.body.amount_minor).toBe(25000);
    });

    it('should return 200 and cached response on idempotent retry', async () => {
      const key = uuidv4();
      // First request
      await request(app)
        .post('/expenses')
        .set('Idempotency-Key', key)
        .send(validExpense);

      // Retry
      const res = await request(app)
        .post('/expenses')
        .set('Idempotency-Key', key)
        .send(validExpense);

      expect(res.status).toBe(200);
      expect(res.body.idempotent_replay).toBe(true);
    });

    it('should return 409 Conflict if key reused with different body', async () => {
      const key = uuidv4();
      await request(app)
        .post('/expenses')
        .set('Idempotency-Key', key)
        .send(validExpense);

      const res = await request(app)
        .post('/expenses')
        .set('Idempotency-Key', key)
        .send({ ...validExpense, amount: "300.00" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('IDEMPOTENCY_CONFLICT');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/expenses')
        .set('Idempotency-Key', uuidv4())
        .send({ amount: "-10", category: "", description: "test", date: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.fields).toHaveProperty('amount');
      expect(res.body.error.fields).toHaveProperty('category');
      expect(res.body.error.fields).toHaveProperty('date');
    });

    it('should return 400 if Idempotency-Key is missing', async () => {
      const res = await request(app)
        .post('/expenses')
        .send(validExpense);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.fields).toHaveProperty('Idempotency-Key');
    });
  });

  describe('GET /expenses', () => {
    it('should return a list of expenses and correct total', async () => {
      // Add another expense
      await request(app)
        .post('/expenses')
        .set('Idempotency-Key', uuidv4())
        .send({ ...validExpense, amount: "100.00", category: "Travel" });

      const res = await request(app).get('/expenses');

      expect(res.status).toBe(200);
      expect(res.body.expenses.length).toBeGreaterThanOrEqual(2);
      expect(res.body.total_amount_minor).toBeGreaterThanOrEqual(35000);
    });

    it('should filter by category correctly (case-insensitive)', async () => {
      const res = await request(app).get('/expenses?category=food');
      
      expect(res.status).toBe(200);
      res.body.expenses.forEach(exp => {
        expect(exp.category.toLowerCase()).toBe('food');
      });
    });

    it('should sort by date descending by default/query', async () => {
      const res = await request(app).get('/expenses?sort=date_desc');
      expect(res.status).toBe(200);
      
      const dates = res.body.expenses.map(e => e.date);
      const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
      expect(dates).toEqual(sortedDates);
    });
  });
});
