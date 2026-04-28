import React from 'react';

const FilterBar = ({ category, onCategoryChange, availableCategories }) => {
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
        Sort: Newest first
      </div>
    </div>
  );
};

export default FilterBar;
