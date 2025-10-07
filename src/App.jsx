import React, { useState, useEffect } from 'react';
import ExcelGrid from './components/ExcelGrid.jsx';

const makeInitialData = (rows, cols) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));

export default function App() {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(10);
  const [data, setData] = useState(() => makeInitialData(rows, cols));
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.add('theme-transition');
    document.body.classList.toggle('theme-dark', dark);
  }, [dark]);

  return (
    <div style={{ padding: '0.75rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'right', marginBottom: '4px' }}>
        <button aria-label="Toggle theme" onClick={() => setDark(d => !d)} style={{ padding: '4px 10px', cursor: 'pointer' }}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
      <ExcelGrid
        rows={rows}
        cols={cols}
        data={data}
        onChange={(next) => setData(next)}
        enableSort
        enableFilters
        enableInsert
        style={{ height: '70vh' }}
      />
    </div>
  );
}
