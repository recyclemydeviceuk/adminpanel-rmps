import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page:        number;
  totalPages:  number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?:   number;
  className?:  string;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = pageSize ? (page - 1) * pageSize + 1 : null;
  const end   = pageSize ? Math.min(page * pageSize, totalItems ?? 0) : null;

  const buildPages = (): (number | string)[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (page > 4) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <p className="text-[12px] text-[#5f6368] hidden sm:block">
        {start && end && totalItems
          ? `Showing ${start}-${end} of ${totalItems.toLocaleString()} results`
          : `Page ${page} of ${totalPages}`
        }
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8eaed] bg-white text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        {buildPages().map((p, i) =>
          typeof p === 'string' ? (
            <span key={`e-${i}`} className="flex h-8 w-8 items-center justify-center text-[12px] text-[#5f6368]">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors border ${p === page ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 hover:text-[#202124]'}`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8eaed] bg-white text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
