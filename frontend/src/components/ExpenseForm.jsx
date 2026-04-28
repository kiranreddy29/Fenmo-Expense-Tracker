import React, { useState } from 'react';

const ExpenseForm = ({ onSubmit, isSubmitting, validationErrors, availableCategories }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, () => {
      // Clear form on success
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    });
  };

  return (
    <div className="card form-card">
      <h2>Add New Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            disabled={isSubmitting}
            className={validationErrors?.amount ? 'error-input' : ''}
          />
          {validationErrors?.amount && <span className="error-text">{validationErrors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {availableCategories && availableCategories.length > 0 && (
              <select
                value={availableCategories.includes(formData.category) ? formData.category : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData(prev => ({ ...prev, category: e.target.value }));
                  }
                }}
                disabled={isSubmitting}
                style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.875rem', fontFamily: 'inherit', backgroundColor: 'var(--surface)' }}
              >
                <option value="" disabled>-- Select existing category --</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder={availableCategories?.length > 0 ? "Or type a new category..." : "e.g. Food, Travel"}
              disabled={isSubmitting}
              className={validationErrors?.category ? 'error-input' : ''}
            />
          </div>
          {validationErrors?.category && <span className="error-text">{validationErrors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Lunch with team"
            disabled={isSubmitting}
            className={validationErrors?.description ? 'error-input' : ''}
          />
          {validationErrors?.description && <span className="error-text">{validationErrors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            max={new Date().toISOString().split('T')[0]}
            value={formData.date}
            onChange={handleChange}
            disabled={isSubmitting}
            className={validationErrors?.date ? 'error-input' : ''}
          />
          {validationErrors?.date && <span className="error-text">{validationErrors.date}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
