-- ==========================================
-- Expense Tracker Database Schema (SQLite)
-- Purpose: Defines the core data model including tables, constraints, and indexes.
-- ==========================================

-- 1. Expenses Table
-- Purpose: Core ledger storing validated financial transactions.
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    
    -- Stored in paise/minor units to prevent floating-point precision loss
    -- Enforce strictly positive amounts
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    
    -- MVP restricts currency to INR natively in the database
    currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
    
    -- Denormalized category as requested to avoid over-engineering
    category TEXT NOT NULL,
    
    -- User provided context
    description TEXT NOT NULL,
    
    -- Standard YYYY-MM-DD enforcement
    date TEXT NOT NULL CHECK (length(date) = 10),
    
    -- ISO-8601 UTC timestamp
    created_at TEXT NOT NULL
);

-- 2. Idempotency Keys Table
-- Purpose: Prevents duplicate expenses resulting from network retries.
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key TEXT PRIMARY KEY,
    request_hash TEXT NOT NULL,
    
    -- Foreign key to ensure referential integrity. 
    -- ON DELETE CASCADE handles cleanups if an expense is manually removed later.
    expense_id TEXT NOT NULL,
    response_body TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

-- 3. Performance Indexes
-- Purpose: Optimize the two primary read operations specified in the PRD.

-- Index for filtering by category (Supports: WHERE LOWER(category) = LOWER(?))
CREATE INDEX IF NOT EXISTS idx_expenses_category_lower ON expenses(LOWER(category));

-- Composite index for default sorting (Supports: ORDER BY date DESC, created_at DESC)
CREATE INDEX IF NOT EXISTS idx_expenses_date_created ON expenses(date DESC, created_at DESC);
