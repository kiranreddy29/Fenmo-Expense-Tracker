import { v4 as uuidv4 } from 'uuid';
import db from '../src/db.js';
import { hashRequestBody } from '../src/utils/hash.js';
import { toMinorUnits } from '../src/utils/money.js';

// ==========================================
// Seed Script
// Purpose: Populates the local SQLite database with realistic expense data for UI testing.
// ==========================================

const categories = ['Food', 'Travel', 'Utilities', 'Entertainment', 'Health'];
const baseDate = new Date();

console.log('🌱 Starting Database Seed...');

const seedExpenses = Array.from({ length: 20 }).map((_, i) => {
    // Generate dates spread across the last 30 days
    const date = new Date(baseDate);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
        amount: (Math.random() * 500 + 10).toFixed(2), // Random between 10.00 and 510.00
        category: categories[Math.floor(Math.random() * categories.length)],
        description: `Sample Seed Expense ${i + 1}`,
        date: date.toISOString().split('T')[0] // YYYY-MM-DD
    };
});

try {
    const insertTx = db.transaction((expenses) => {
        const insertExpenseStmt = db.prepare(`
            INSERT INTO expenses (id, amount_minor, currency, category, description, date, created_at)
            VALUES (?, ?, 'INR', ?, ?, ?, ?)
        `);

        const insertKeyStmt = db.prepare(`
            INSERT INTO idempotency_keys (key, request_hash, expense_id, response_body, created_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const data of expenses) {
            const expenseId = `exp_${uuidv4()}`;
            const idempotencyKey = uuidv4();
            const createdAt = new Date().toISOString();
            const amountMinor = toMinorUnits(data.amount);
            
            const response = {
                id: expenseId,
                amount: data.amount,
                amount_minor: amountMinor,
                currency: 'INR',
                category: data.category,
                description: data.description,
                date: data.date,
                created_at: createdAt
            };

            const requestHash = hashRequestBody(data);

            insertExpenseStmt.run(expenseId, amountMinor, data.category, data.description, data.date, createdAt);
            insertKeyStmt.run(idempotencyKey, requestHash, expenseId, JSON.stringify(response), createdAt);
        }
    });

    insertTx(seedExpenses);
    console.log(`✅ Successfully seeded ${seedExpenses.length} expense records.`);
} catch (error) {
    console.error('❌ Failed to seed database:', error);
}

// Verification Output
const rowCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get();
console.log(`📊 Total Expenses in DB: ${rowCount.count}`);
