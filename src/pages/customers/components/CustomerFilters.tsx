import SearchInput from '../../../components/ui/SearchInput';
import Select from '../../../components/ui/Select';
import type { CustomerStatus } from '../../../types/customer';

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: CustomerStatus | '';
  onStatusChange: (v: CustomerStatus | '') => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
];

export default function CustomerFilters({ search, onSearchChange, status, onStatusChange }: CustomerFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name, email, phone..."
        className="flex-1 min-w-0"
      />
      <Select
        options={STATUS_OPTIONS}
        value={status}
        onChange={e => onStatusChange(e.target.value as CustomerStatus | '')}
        className="w-full sm:w-44"
      />
    </div>
  );
}
