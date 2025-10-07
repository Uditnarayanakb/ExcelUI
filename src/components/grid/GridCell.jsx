import React from 'react';

export function GridCell({
  r,
  c,
  value,
  isFocused,
  className,
  onChange,
  onFocus,
  onKeyDown,
  register
}) {
  return (
    <div className={className}>
      <input
        ref={el => register(r, c, el)}
        value={value}
        onChange={e => onChange(r, c, e.target.value)}
        onFocus={() => onFocus(r, c)}
        onKeyDown={e => onKeyDown(e, r, c)}
        aria-rowindex={r + 2}
        aria-colindex={c + 2}
      />
    </div>
  );
}
