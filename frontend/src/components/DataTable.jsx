import { useMemo, useState } from 'react';
import { SortIcon } from './icons';
import { EmptyIcon } from './icons';

/**
 * Generic sortable table.
 * columns: [{ key, label, sortable=true, accessor?: row => sortValue, render?: row => node }]
 * rows: array of data objects, each needs a stable `id`.
 */
export default function DataTable({ columns, rows, emptyLabel = 'No records to show.' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const column = columns.find((c) => c.key === sortKey);
    const accessor = column?.accessor || ((row) => row[sortKey]);
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (typeof va === 'number' && typeof vb === 'number') return va - vb;
      return String(va ?? '').localeCompare(String(vb ?? ''));
    });
    if (sortDir === 'desc') copy.reverse();
    return copy;
  }, [rows, sortKey, sortDir, columns]);

  function toggleSort(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    }
  }

  if (!rows.length) {
    return (
      <div className="card empty-state">
        <EmptyIcon />
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable === false ? '' : 'sortable'}
                onClick={() => col.sortable !== false && toggleSort(col.key)}
              >
                <span className="th-inner">
                  {col.label}
                  {col.sortable !== false && (
                    <SortIcon direction={sortKey === col.key ? sortDir : null} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
