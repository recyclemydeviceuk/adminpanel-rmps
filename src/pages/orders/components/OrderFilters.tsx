import Select from '../../../components/ui/Select';
import SearchInput from '../../../components/ui/SearchInput';
import type { OrderStatus } from '../../../types/order';

interface OrderFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: OrderStatus | '') => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderFilters({
  search, onSearchChange,
  status, onStatusChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by order, customer, device..."
          className="flex-1 min-w-0"
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={e => onStatusChange(e.target.value as OrderStatus | '')}
          className="w-full sm:w-44"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 text-[12px] text-[#5f6368]">
          <span className="font-medium whitespace-nowrap">Date range:</span>
        </div>
        <div className="flex gap-2 flex-1">
          <input
            type="date"
            value={dateFrom}
            onChange={e => onDateFromChange(e.target.value)}
            className="flex-1 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[13px] text-[#202124] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
          <span className="self-center text-[12px] text-[#9aa0a6]">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => onDateToChange(e.target.value)}
            className="flex-1 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[13px] text-[#202124] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { onDateFromChange(''); onDateToChange(''); }}
              className="px-3 py-2 text-[12px] font-medium text-[#5f6368] rounded-xl border border-[#e8eaed] hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
