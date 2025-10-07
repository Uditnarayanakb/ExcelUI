export const SORT_NONE = 0;
export const SORT_ASC = 1;
export const SORT_DESC = 2;

export function columnLabel(index) {
  let label = '';
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}
