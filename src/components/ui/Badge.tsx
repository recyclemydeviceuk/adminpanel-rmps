import type { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'orange'
  | 'paid'
  | 'pending'
  | 'failed';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100  text-gray-600',
  success: 'bg-green-50  text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  danger:  'bg-red-50    text-red-700',
  info:    'bg-blue-50   text-blue-700',
  purple:  'bg-purple-50 text-purple-700',
  orange:  'bg-orange-50 text-orange-700',
  paid:    'bg-green-50  text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  failed:  'bg-red-50    text-red-700',
};

const DOT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  purple:  'bg-purple-500',
  orange:  'bg-orange-500',
  paid:    'bg-green-500',
  pending: 'bg-yellow-500',
  failed:  'bg-red-500',
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5
        text-[11px] font-semibold leading-none whitespace-nowrap
        ${STYLES[variant]} ${className}
      `}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${DOT_STYLES[variant]}`} />
      )}
      {children}
    </span>
  );
}
