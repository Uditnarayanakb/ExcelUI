import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../excelGrid.css';

import { SORT_NONE, SORT_ASC, SORT_DESC, columnLabel } from '../constants/grid.js';
import { HeaderRow } from './grid/HeaderRow.jsx';
import { FilterRow } from './grid/FilterRow.jsx';
import { DataRow } from './grid/DataRow.jsx';
import { GridCell } from './grid/GridCell.jsx';

export default function ExcelGrid({
  rows,
  cols,
  data,
  onChange,
  enableSort = false,
  enableFilters = false,
  enableInsert = false,
  style
}) {
  const [gridData, setGridData] = useState(data);
  const [focus, setFocus] = useState({ r: 0, c: 0 });
  const [anchor, setAnchor] = useState({ r: 0, c: 0 });
  const [range, setRange] = useState(null);
  const [sortState, setSortState] = useState(() => Array(cols).fill(SORT_NONE));
  const [filters, setFilters] = useState(() => Array(cols).fill(''));
  const containerRef = useRef(null);
  const cellRefs = useRef(new Map());

  useEffect(() => { setGridData(data); }, [data]);
  useEffect(() => { onChange && onChange(gridData); }, [gridData, onChange]);

  const colCount = useMemo(() => (gridData[0]?.length) ?? cols, [gridData, cols]);
  const rowCount = useMemo(() => gridData.length || rows, [gridData, rows]);

  useEffect(() => {
    setSortState(prev => {
      if (prev.length === colCount) return prev;
      const next = Array(colCount).fill(SORT_NONE);
      for (let i = 0; i < Math.min(prev.length, colCount); i++) next[i] = prev[i];
      return next;
    });
    setFilters(prev => {
      if (prev.length === colCount) return prev;
      const next = Array(colCount).fill('');
      for (let i = 0; i < Math.min(prev.length, colCount); i++) next[i] = prev[i];
      return next;
    });
  }, [colCount]);

  const visibleRowIndexes = useMemo(() => {
    let idxs = [...Array(rowCount).keys()];
    if (enableFilters) {
      idxs = idxs.filter(r => filters.every((f, c) => !f || String(gridData[r][c] ?? '').toLowerCase().includes(f.toLowerCase())));
    }
    if (enableSort) {
      const primary = sortState.findIndex(s => s !== SORT_NONE);
      if (primary >= 0) {
        const dir = sortState[primary];
        idxs.sort((a, b) => {
          const av = gridData[a][primary] ?? '';
          const bv = gridData[b][primary] ?? '';
          if (av === bv) return 0;
          if (dir === SORT_ASC) return av > bv ? 1 : -1;
          return av < bv ? 1 : -1;
        });
      }
    }
    return idxs;
  }, [gridData, filters, sortState, enableFilters, enableSort, rowCount]);

  const cycleSort = useCallback((col) => {
    setSortState(prev => prev.map((s, i) => i === col ? (s + 1) % 3 : SORT_NONE));
  }, []);

  const updateCell = useCallback((r, c, val) => {
    setGridData(prev => {
      const copy = prev.map(row => [...row]);
      copy[r][c] = val;
      return copy;
    });
  }, []);

  const normalizeRange = useCallback((a, b) => {
    const r1 = Math.min(a.r, b.r); const r2 = Math.max(a.r, b.r);
    const c1 = Math.min(a.c, b.c); const c2 = Math.max(a.c, b.c);
    return { r1, c1, r2, c2 };
  }, []);

  const applyPaste = useCallback((baseR, baseC, text) => {
    const rowsText = text.replace(/\r/g, '').split(/\n/).filter(l => l.length > 0);
    if (!rowsText.length) return;
    setGridData(prev => {
      const clone = prev.map(r => [...r]);
      rowsText.forEach((line, i) => {
        const colsVals = line.split('\t');
        colsVals.forEach((val, j) => {
          const tr = baseR + i;
          const tc = baseC + j;
          if (tr < clone.length && tc < (clone[0]?.length ?? 0)) {
            clone[tr][tc] = val;
          }
        });
      });
      return clone;
    });
  }, []);

  const handleKey = useCallback((e, r, c) => {
    let nr = r, nc = c;
    const maxR = rowCount - 1; const maxC = colCount - 1;
    const moveFocus = () => {
      e.preventDefault();
      setFocus({ r: nr, c: nc });
      requestAnimationFrame(() => {
        const key = `${nr},${nc}`;
        const el = cellRefs.current.get(key);
        if (el) el.focus();
      });
    };

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // move left, wrap to previous row end
        if (c > 0) nc = c - 1; else if (r > 0) { nr = r - 1; nc = maxC; }
      } else {
        if (c < maxC) nc = c + 1; else if (r < maxR) { nr = r + 1; nc = 0; }
      }
      moveFocus();
      return;
    }
    if (e.shiftKey && /^Arrow/.test(e.key)) {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowRight': if (c < maxC) nc = c + 1; break;
        case 'ArrowLeft': if (c > 0) nc = c - 1; break;
        case 'ArrowDown': if (r < maxR) nr = r + 1; break;
        case 'ArrowUp': if (r > 0) nr = r - 1; break;
        default: break;
      }
      const newFocus = { r: nr, c: nc };
      setFocus(newFocus);
      setRange(normalizeRange(anchor, newFocus));
      requestAnimationFrame(() => {
        const el = cellRefs.current.get(`${nr},${nc}`);
        if (el) el.focus();
      });
      return;
    }
    switch (e.key) {
      case 'ArrowRight': if (c < maxC) { nc = c + 1; moveFocus(); } break;
      case 'ArrowLeft': if (c > 0) { nc = c - 1; moveFocus(); } break;
      case 'ArrowDown': if (r < maxR) { nr = r + 1; moveFocus(); } break;
      case 'ArrowUp': if (r > 0) { nr = r - 1; moveFocus(); } break;
      case 'Enter':
        e.preventDefault();
        if (e.shiftKey) { if (r > 0) nr = r - 1; }
        else { if (r < maxR) nr = r + 1; }
        moveFocus();
        break;
      case 'Home': e.preventDefault(); nc = 0; moveFocus(); break;
      case 'End': e.preventDefault(); nc = maxC; moveFocus(); break;
      default: break;
    }
  }, [rowCount, colCount]);

  useEffect(() => {
    const handlerCopy = (e) => {
      if (!range) return;
      const { r1, c1, r2, c2 } = range;
      let out = '';
      for (let r = r1; r <= r2; r++) {
        const rowArr = [];
        for (let c = c1; c <= c2; c++) rowArr.push(gridData[r][c] ?? '');
        out += rowArr.join('\t');
        if (r < r2) out += '\n';
      }
      e.clipboardData.setData('text/plain', out);
      e.preventDefault();
    };
    const handlerPaste = (e) => {
      if (!focus) return;
      const txt = e.clipboardData.getData('text');
      if (txt) {
        applyPaste(focus.r, focus.c, txt);
        e.preventDefault();
      }
    };
    const el = containerRef.current;
    if (el) {
      el.addEventListener('copy', handlerCopy);
      el.addEventListener('paste', handlerPaste);
    }
    return () => {
      if (el) {
        el.removeEventListener('copy', handlerCopy);
        el.removeEventListener('paste', handlerPaste);
      }
    };
  }, [range, focus, gridData, applyPaste]);

  const insertRow = useCallback((at) => {
    setGridData(prev => {
      const newRow = Array(colCount).fill('');
      const copy = prev.map(r => [...r]);
      copy.splice(at, 0, newRow);
      return copy;
    });
  }, [colCount]);

  const insertCol = useCallback((at) => {
    setGridData(prev => prev.map(row => {
      const copy = [...row];
      copy.splice(at, 0, '');
      return copy;
    }));
    setSortState(prev => {
      const next = [...prev];
      next.splice(at, 0, SORT_NONE);
      return next;
    });
    setFilters(prev => {
      const next = [...prev];
      next.splice(at, 0, '');
      return next;
    });
  }, []);

  const headerClass = (c) => c === focus.c ? 'eg-header active' : 'eg-header';
  const indexClass = (r) => r === focus.r ? 'eg-index active' : 'eg-index';

  const registerCellRef = (r, c, el) => {
    const key = `${r},${c}`;
    if (el) cellRefs.current.set(key, el);
  };

  const onFilterChange = (c, value) => setFilters(f => f.map((v,i)=> i===c? value : v));
  const handleCellFocus = (r, c) => { setFocus({ r, c }); setAnchor({ r, c }); setRange(null); };
  const renderCell = (rVisible, c) => {
    const rawVal = gridData[rVisible][c] ?? '';
    const isFocused = focus.r === rVisible && focus.c === c;
    let extraCls = '';
    if (range) {
      const { r1, c1, r2, c2 } = range;
      if (rVisible >= r1 && rVisible <= r2 && c >= c1 && c <= c2) {
        extraCls += ' selected-range';
        if (rVisible === r1 || rVisible === r2 || c === c1 || c === c2) extraCls += ' range-edge';
      }
    }
    return (
      <GridCell
        key={`${rVisible}-${c}`}
        r={rVisible}
        c={c}
        value={rawVal}
        isFocused={isFocused}
        className={"eg-cell" + (isFocused ? ' focused' : '') + extraCls}
        onChange={updateCell}
        onFocus={handleCellFocus}
        onKeyDown={handleKey}
        register={registerCellRef}
      />
    );
  };

  return (
    <div className="excel-grid-wrapper" style={style} ref={containerRef}>
      <div className="eg-table" role="grid" aria-rowcount={rowCount} aria-colcount={colCount}>
        <HeaderRow
          colCount={colCount}
            enableSort={enableSort}
            sortState={sortState}
            onSortToggle={cycleSort}
            enableInsert={enableInsert}
            onInsertCol={insertCol}
        />
        {enableFilters && (
          <FilterRow
            colCount={colCount}
            filters={filters}
            onFilterChange={onFilterChange}
          />
        )}
        {visibleRowIndexes.map(rVisible => (
          <DataRow
            key={rVisible}
            rVisible={rVisible}
            colCount={colCount}
            enableInsert={enableInsert}
            onInsertRow={insertRow}
            indexClass={indexClass}
            renderCell={renderCell}
          />
        ))}
      </div>
    </div>
  );
}
