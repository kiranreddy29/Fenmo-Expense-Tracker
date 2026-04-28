import React from 'react';

const ExpenseTable = ({ expenses, isLoading, isError, onRetry }) => {
  if (isLoading) {
    return <div className="state-message">Loading expenses...</div>;
  }

  if (isError) {
    return (
      <div className="state-message error-state">
        <p>Failed to load expenses.</p>
        <button onClick={onRetry} className="btn-secondary">Retry</button>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return <div className="state-message">No expenses found.</div>;
  }

  return (
    <div className="table-container">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th className="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td data-label="Date">{expense.date}</td>
              <td data-label="Category">
                <span className="category-badge">{expense.category}</span>
              </td>
              <td data-label="Description">{expense.description}</td>
              <td data-label="Amount" className="amount-col font-mono">
                ₹{expense.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
