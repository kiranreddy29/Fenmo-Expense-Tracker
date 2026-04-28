import React from 'react';

const FilterBar = ({ category, onCategoryChange, availableCategories, sortOrder, onSortChange }) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="categoryFilter">Filter by Category:</label>
        <select
          id="categoryFilter"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="All">All Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="sort-indicator">
        <label htmlFor="sortOrder" style={{ marginRight: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Sort:</label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'var(--surface)' }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
