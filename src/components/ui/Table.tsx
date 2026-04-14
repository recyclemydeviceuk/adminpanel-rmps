import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key:        string;
  header:     string;
  render?:    (row: T, index: number) => ReactNode;
  width?:     string;
  align?:     'left' | 'center' | 'right';
  className?: string;
}

interface TableProps<T> {
  columns:        TableColumn<T>[];
  data:           T[];
  keyExtractor:   (row: T, index: number) => string;
  onRowClick?:    (row: T) => void;
  emptyMessage?:  string;
  loading?:       boolean;
  className?:     string;
}

export default function Table<T extends object>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data found.',
  loading = false,
  className = '',
}: TableProps<T>) {
  const alignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right')  return 'text-right';
    return 'text-left';
  };

  return (
    <div className={`overflow-x-auto rounded-xl border border-[#f3f4f6] ${className}`}>
      <table className="min-w-full divide-y divide-[#f3f4f6]">
        <thead className="bg-[#f8fafc]">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`
                  px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em]
                  text-[#5f6368] select-none
                  ${alignClass(col.align)}
                  ${col.className ?? ''}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f3f4f6] bg-white">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-14 text-center text-[13px] text-[#5f6368]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-colors duration-100
                  ${onRowClick ? 'cursor-pointer hover:bg-[#fafbfc]' : ''}
                `}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`
                      px-4 py-3.5 text-[13px] text-[#202124]
                      ${alignClass(col.align)}
                      ${col.className ?? ''}
                    `}
                  >
                    {col.render
                      ? col.render(row, index)
                      : String((row as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
