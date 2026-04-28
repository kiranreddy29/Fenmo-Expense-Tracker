-- ==========================================
-- Sample Reporting & Verification Queries
-- Purpose: Demonstrate schema correctness for future dashboard or reporting integrations.
-- ==========================================

-- 1. Default Dashboard Feed
-- Retrieves the 50 most recent expenses, correctly sorted.
-- Explores: Composite Index `idx_expenses_date_created`
SELECT id, amount_minor, category, description, date 
FROM expenses 
ORDER BY date DESC, created_at DESC 
LIMIT 50;

-- 2. Category Aggregation
-- Summarizes total spending per category.
-- Explores: Grouping and integer math (no floating point issues)
SELECT 
    category, 
    COUNT(*) as total_transactions, 
    SUM(amount_minor) / 100.0 as total_spent_display
FROM expenses 
GROUP BY category
ORDER BY total_spent_display DESC;

-- 3. Monthly Spending Summary (Date-based Filtering)
-- Extracts spending totals grouped by Year-Month.
-- Explores: SQLite substr() on ISO dates.
SELECT 
    substr(date, 1, 7) as month, 
    SUM(amount_minor) as total_paise
FROM expenses 
GROUP BY month
ORDER BY month DESC;

-- 4. Audit Query: Verify Idempotency Integrity
-- Finds all idempotency keys and their related expense details.
SELECT 
    i.key, 
    i.request_hash, 
    e.id as expense_id, 
    e.amount_minor, 
    e.date
FROM idempotency_keys i
JOIN expenses e ON i.expense_id = e.id
ORDER BY i.created_at DESC;
