import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
  options:  SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
}

export default function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  wrapperClassName = '',
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={selectId} className="text-[13px] font-medium text-[#202124]">
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10
            text-[14px] text-[#202124]
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60
            ${error
              ? 'border-red-400 focus:ring-red-500'
              : 'border-[#e8eaed] focus:ring-red-600'
            }
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6368]"
        />
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}
      {hint && !error && <p className="text-[12px] text-[#5f6368]">{hint}</p>}
    </div>
  );
}
