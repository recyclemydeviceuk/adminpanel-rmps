import type { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value:       string;
  onChange:    (value: string) => void;
  placeholder?: string;
  className?:  string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  ...props
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-[#e8eaed] bg-white
          pl-9 pr-9 py-2.5 text-[14px] text-[#202124]
          placeholder:text-[#9aa0a6]
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent
        "
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#9aa0a6] hover:text-[#5f6368] hover:bg-gray-100 transition-colors"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
