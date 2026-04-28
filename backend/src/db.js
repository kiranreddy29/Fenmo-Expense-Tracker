import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../data/expenses.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL CHECK (length(date) = 10),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS idempotency_keys (
    key TEXT PRIMARY KEY,
    request_hash TEXT NOT NULL,
    expense_id TEXT NOT NULL,
    response_body TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
  );

  -- Index for fast category filtering (case-insensitive as required by PRD)
  CREATE INDEX IF NOT EXISTS idx_expenses_category_lower ON expenses(LOWER(category));
  
  -- Composite index for fast default sorting (newest date first, then newest creation)
  CREATE INDEX IF NOT EXISTS idx_expenses_date_created ON expenses(date DESC, created_at DESC);
`);

export default db;
