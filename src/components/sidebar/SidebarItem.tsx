import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  end?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  to,
  icon: Icon,
  label,
  badge,
  end = false,
  onClick,
}: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium
         transition-all duration-150 group select-none
         ${
           isActive
             ? 'bg-red-600 text-white shadow-sm'
             : 'text-gray-400 hover:bg-white/8 hover:text-white'
         }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            className={`flex-shrink-0 transition-colors duration-150 ${
              isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'
            }`}
          />
          <span className="flex-1 truncate leading-none">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span
              className={`
                inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                rounded-full text-[10px] font-bold leading-none
                ${isActive ? 'bg-white/25 text-white' : 'bg-red-600 text-white'}
              `}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
