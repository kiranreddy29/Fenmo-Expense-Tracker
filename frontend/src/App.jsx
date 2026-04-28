import React, { useState, useEffect, useMemo } from 'react';
import { fetchExpenses, createExpense } from './api';
import ExpenseForm from './components/ExpenseForm';
import SummaryCard from './components/SummaryCard';
import ExpenseTable from './components/ExpenseTable';
import FilterBar from './components/FilterBar';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [availableCategories, setAvailableCategories] = useState([]);  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Feedback
  const [validationErrors, setValidationErrors] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Keep a running master list of categories so filtering doesn't erase them
  useEffect(() => {
    if (expenses.length > 0) {
      setAvailableCategories(prev => {
        const merged = new Set([...prev, ...expenses.map(e => e.category)]);
        return Array.from(merged).sort();
      });
    }
  }, [expenses]);

  // Frontend sorting to support both Newest and Oldest without backend changes
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return sortOrder === 'newest' ? dateDiff : -dateDiff;
      const createdDiff = new Date(b.created_at) - new Date(a.created_at);
      return sortOrder === 'newest' ? createdDiff : -createdDiff;
    });
  }, [expenses, sortOrder]);

  const loadExpenses = async (category = '') => {
    setIsLoading(true);
    setIsError(false);
    setGlobalError('');
    try {
      const data = await fetchExpenses(category);
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      setIsError(true);
      setGlobalError('Failed to load expenses. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and refetch on filter change
  useEffect(() => {
    loadExpenses(categoryFilter);
  }, [categoryFilter]);

  const handleAddExpense = async (formData, onSuccess) => {
    setIsSubmitting(true);
    setValidationErrors(null);
    setGlobalError('');
    setSuccessMsg('');

    // Generate idempotency key natively
    const idempotencyKey = crypto.randomUUID();

    try {
      await createExpense(formData, idempotencyKey);
      setSuccessMsg('Expense added successfully!');
      
      // Proactively add new category to dropdowns in case we are currently filtered
      setAvailableCategories(prev => Array.from(new Set([...prev, formData.category])).sort());
      
      // Clear form via callback
      onSuccess();
      
      // Refresh list (maintaining current filter if applicable)
      loadExpenses(categoryFilter);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR') {
        setValidationErrors(err.fields);
      } else if (err.code === 'IDEMPOTENCY_CONFLICT') {
        setGlobalError('Duplicate request detected. Please try again.');
      } else {
        setGlobalError(err.message || 'Failed to add expense.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <span className="logo">💸</span>
          <h1>Expense Tracker</h1>
        </div>
      </header>

      <main className="main-content">
        {globalError && (
          <div className="global-error">
            {globalError}
          </div>
        )}
        
        {successMsg && (
          <div className="global-success">
            {successMsg}
          </div>
        )}

        <div className="dashboard-grid">
          <aside className="sidebar">
            <ExpenseForm 
              onSubmit={handleAddExpense} 
              isSubmitting={isSubmitting} 
              validationErrors={validationErrors} 
              availableCategories={availableCategories}
            />
          </aside>
          
          <section className="feed">
            <div className="card feed-card">
              <FilterBar 
                category={categoryFilter} 
                onCategoryChange={setCategoryFilter} 
                availableCategories={availableCategories} 
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
              />
              <ExpenseTable 
                expenses={sortedExpenses} 
                isLoading={isLoading} 
                isError={isError} 
                onRetry={() => loadExpenses(categoryFilter)} 
              />
            </div>
            
            <div style={{ marginTop: '1.5rem' }}>
              <SummaryCard total={total} count={expenses.length} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
