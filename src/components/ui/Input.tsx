import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  wrapperClassName?: string;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  wrapperClassName = '',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-[#202124]">
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5f6368]">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`
            w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] text-[#202124]
            placeholder:text-[#9aa0a6]
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60
            ${error
              ? 'border-red-400 focus:ring-red-500'
              : 'border-[#e8eaed] focus:ring-red-600'
            }
            ${leftIcon  ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5f6368]">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}
      {hint && !error && <p className="text-[12px] text-[#5f6368]">{hint}</p>}
    </div>
  );
}
