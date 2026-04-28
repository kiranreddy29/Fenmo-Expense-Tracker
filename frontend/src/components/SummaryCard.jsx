import React from 'react';

const SummaryCard = ({ total, count }) => {
  return (
    <div className="card summary-card">
      <div className="summary-stat">
        <span className="summary-label">Total Visible Expenses</span>
        <span className="summary-value font-mono">₹{total}</span>
      </div>
      <div className="summary-stat right-align">
        <span className="summary-label">Transactions</span>
        <span className="summary-value count-value">{count}</span>
      </div>
    </div>
  );
};

export default SummaryCard;
