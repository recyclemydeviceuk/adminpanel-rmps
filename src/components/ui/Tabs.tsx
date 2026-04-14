import type { ReactNode } from 'react';

export interface Tab {
  key:     string;
  label:   string;
  icon?:   ReactNode;
  count?:  number;
}

interface TabsProps {
  tabs:       Tab[];
  active:     string;
  onChange:   (key: string) => void;
  className?: string;
  variant?:   'underline' | 'pill';
}

export default function Tabs({
  tabs,
  active,
  onChange,
  className = '',
  variant = 'pill',
}: TabsProps) {
  if (variant === 'underline') {
    return (
      <div className={`flex gap-0 border-b border-[#e8eaed] ${className}`}>
        {tabs.map(tab => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-3 text-[13px] font-medium
                border-b-2 -mb-px transition-all duration-150 select-none
                ${isActive
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`
                  inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                  rounded-full text-[10px] font-bold leading-none
                  ${isActive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-[#5f6368]'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 rounded-xl ${className}`}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
              text-[13px] font-medium transition-all duration-150 select-none
              ${isActive
                ? 'bg-white text-[#202124] shadow-sm'
                : 'text-[#5f6368] hover:text-[#202124]'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`
                inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                rounded-full text-[10px] font-bold leading-none
                ${isActive ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-[#5f6368]'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
