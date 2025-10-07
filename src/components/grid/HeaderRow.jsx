import React from 'react';
import { columnLabel, SORT_ASC, SORT_DESC } from '../../constants/grid.js';

export function HeaderRow({ colCount, enableSort, sortState, onSortToggle, enableInsert, onInsertCol }) {
  return (
    <div className="eg-row eg-header-row">
      <div className="eg-corner" />
      {Array.from({ length: colCount }, (_, c) => (
        <div key={c} className="eg-header">
          <button
            type="button"
            className="eg-header-btn"
            onClick={() => enableSort && onSortToggle(c)}
            title={enableSort ? 'Click to sort' : undefined}
          >
            {columnLabel(c)}{enableSort && sortState[c] === SORT_ASC && ' ▲'}{enableSort && sortState[c] === SORT_DESC && ' ▼'}
          </button>
          {enableInsert && (
            <div className="eg-insert-col">
              <button type="button" onClick={() => onInsertCol(c)} title="Insert column here">＋</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
