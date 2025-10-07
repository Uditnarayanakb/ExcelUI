import React from 'react';

export function FilterRow({ colCount, filters, onFilterChange }) {
  return (
    <div className="eg-row eg-filter-row">
      <div className="eg-index filter-label">Filter</div>
      {Array.from({ length: colCount }, (_, c) => (
        <div key={c} className="eg-filter-cell">
          <input
            value={filters[c]}
            onChange={e => onFilterChange(c, e.target.value)}
            placeholder="contains..."
          />
        </div>
      ))}
    </div>
  );
}
