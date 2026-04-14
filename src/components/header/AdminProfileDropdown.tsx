import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    success('Logged out', 'You have been signed out successfully.');
    navigate('/login');
  };

  if (!user) return null;

  /* Avatar initials */
  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-1.5 hover:bg-gray-50 transition-colors duration-150"
      >
        {/* Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-[11px] font-bold text-white">
          {initials}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-[13px] font-semibold text-[#202124] leading-none">{user.name}</p>
          <p className="text-[11px] text-[#5f6368] mt-0.5">Super Admin</p>
        </div>
        <ChevronDown
          size={14}
          className={`text-[#5f6368] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-[#e8eaed] bg-white shadow-xl animate-fade-in overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#f3f4f6]">
            <p className="text-[13px] font-semibold text-[#202124] truncate">{user.name}</p>
            <p className="text-[12px] text-[#5f6368] truncate mt-0.5">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5">
              <Shield size={10} className="text-red-600" />
              <span className="text-[10px] font-semibold text-red-600">Super Admin</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { navigate('/settings'); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] transition-colors"
            >
              <Settings size={15} />
              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-[#f3f4f6] py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
