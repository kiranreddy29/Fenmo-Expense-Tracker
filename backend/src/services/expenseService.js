import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMinorUnits, toDisplayString } from '../utils/money.js';
import { hashRequestBody } from '../utils/hash.js';
import { IdempotencyConflictError } from '../utils/errors.js';

class ExpenseService {
  createExpense(data, idempotencyKey) {
    const requestHash = hashRequestBody(data);
    
    // Check for existing idempotency key
    const existing = db.prepare('SELECT * FROM idempotency_keys WHERE key = ?').get(idempotencyKey);
    
    if (existing) {
      if (existing.request_hash !== requestHash) {
        throw new IdempotencyConflictError();
      }
      return {
        ...JSON.parse(existing.response_body),
        idempotent_replay: true
      };
    }

    const { amount, category, description, date } = data;
    const id = `exp_${uuidv4()}`;
    const amountMinor = toMinorUnits(amount);
    const createdAt = new Date().toISOString();

    const response = {
      id,
      amount,
      amount_minor: amountMinor,
      currency: 'INR',
      category,
      description,
      date,
      created_at: createdAt
    };

    // Use a transaction for atomicity
    const insertTransaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO expenses (id, amount_minor, currency, category, description, date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, amountMinor, 'INR', category, description, date, createdAt);

      db.prepare(`
        INSERT INTO idempotency_keys (key, request_hash, expense_id, response_body, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(idempotencyKey, requestHash, id, JSON.stringify(response), createdAt);
    });

    insertTransaction();
    return response;
  }

  getExpenses(filters = {}) {
    let query = 'SELECT * FROM expenses';
    const params = [];
    const whereClauses = [];

    if (filters.category) {
      whereClauses.push('LOWER(category) = LOWER(?)');
      params.push(filters.category.trim());
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Always sort newest first — frontend handles oldest-first via local array reversal
    query += ' ORDER BY date DESC, created_at DESC';

    const expenses = db.prepare(query).all(...params).map(row => ({
      id: row.id,
      amount: toDisplayString(row.amount_minor),
      amount_minor: row.amount_minor,
      currency: row.currency,
      category: row.category,
      description: row.description,
      date: row.date,
      created_at: row.created_at
    }));

    const totalMinor = expenses.reduce((sum, exp) => sum + exp.amount_minor, 0);

    return {
      expenses,
      total_amount_minor: totalMinor,
      total: toDisplayString(totalMinor),
      currency: 'INR'
    };
  }
}

export default new ExpenseService();
