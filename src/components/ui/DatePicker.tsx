import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toLocalDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISOLocal(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function formatDisplay(iso: string): string {
  const d = toLocalDate(iso);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DatePicker({ value, onChange, label, placeholder = 'Select date' }: DatePickerProps) {
  const today = new Date();
  const selected = toLocalDate(value);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left });
    }
    setOpen(p => !p);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const handleSelect = (day: number) => {
    onChange(toISOLocal(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  };

  const isTodayDay = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const isSelectedDay = (day: number) =>
    selected?.getFullYear() === viewYear && selected?.getMonth() === viewMonth && selected?.getDate() === day;

  return (
    <div className="relative inline-block">
      {label && (
        <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-bold uppercase tracking-wide text-[#9aa0a6]">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`flex min-w-[170px] items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left transition-all ${
          open ? 'border-red-400 ring-2 ring-red-100' : 'border-[#e8eaed] hover:border-gray-300'
        }`}
      >
        <Calendar size={14} className={value ? 'text-red-500' : 'text-[#9aa0a6]'} />
        <span className={`flex-1 text-[13px] ${value ? 'font-semibold text-[#202124]' : 'text-[#9aa0a6]'}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value ? (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange(''); }}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[#5f6368] hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <X size={10} />
          </span>
        ) : (
          <ChevronRight size={12} className={`text-[#9aa0a6] transition-transform ${open ? 'rotate-90' : ''}`} />
        )}
      </button>

      {/* Portal dropdown — fixed position, never clipped */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="w-72 overflow-hidden rounded-2xl border border-[#e8eaed] bg-white shadow-2xl"
        >
          {/* Red gradient header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-500 px-4 py-3">
            <button type="button" onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-[14px] font-bold text-white">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day name headers */}
          <div className="grid grid-cols-7 border-b border-[#f1f3f4] bg-[#f8fafc] px-3 py-2">
            {DAYS.map(d => (
              <span key={d} className="text-center text-[11px] font-bold uppercase text-[#9aa0a6]">{d}</span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1 p-3">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const sel = isSelectedDay(day);
              const tod = isTodayDay(day);
              return (
                <button key={day} type="button" onClick={() => handleSelect(day)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-[13px] font-semibold transition-all duration-100 ${
                    sel ? 'scale-105 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-200'
                    : tod ? 'bg-red-50 text-red-600 ring-1 ring-red-300'
                    : 'text-[#202124] hover:bg-red-50 hover:text-red-600'
                  }`}>
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#f1f3f4] px-4 py-2.5">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="text-[12px] font-semibold text-[#5f6368] hover:text-red-600 transition-colors">
              Clear
            </button>
            <button type="button"
              onClick={() => { const t = new Date(); setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); handleSelect(t.getDate()); }}
              className="rounded-lg bg-red-50 px-3 py-1 text-[12px] font-bold text-red-600 hover:bg-red-100 transition-colors">
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
