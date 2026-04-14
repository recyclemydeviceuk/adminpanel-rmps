import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children:  ReactNode;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:   'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  secondary: 'bg-white text-[#202124] border border-[#e8eaed] hover:bg-gray-50 active:bg-gray-100',
  ghost:     'bg-transparent text-[#5f6368] hover:bg-gray-100 active:bg-gray-200',
  danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:bg-red-200',
  outline:   'bg-transparent text-red-600 border border-red-600 hover:bg-red-50 active:bg-red-100',
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'h-8  px-3   text-[12px] gap-1.5 rounded-xl',
  md: 'h-10 px-4   text-[13px] gap-2   rounded-xl',
  lg: 'h-11 px-5   text-[14px] gap-2   rounded-xl',
};

export default function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150 select-none whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="border-current border-t-transparent" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
