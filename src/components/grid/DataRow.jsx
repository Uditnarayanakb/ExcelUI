import React from 'react';

export function DataRow({
  rVisible,
  colCount,
  enableInsert,
  onInsertRow,
  indexClass,
  renderCell
}) {
  return (
    <div className="eg-row" role="row">
      <div className={indexClass(rVisible)}>
        <span>{rVisible + 1}</span>
        {enableInsert && (
          <div className="eg-insert-row">
            <button type="button" onClick={() => onInsertRow(rVisible)} title="Insert row here">＋</button>
          </div>
        )}
      </div>
      {Array.from({ length: colCount }, (_, c) => renderCell(rVisible, c))}
    </div>
  );
}
