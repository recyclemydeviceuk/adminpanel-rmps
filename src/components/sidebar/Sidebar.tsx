import { useEffect } from 'react';
import { X } from 'lucide-react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BookOpen,
  Smartphone,
  Layers,
  GitBranch,
  Cpu,
  Wrench,
  Package,
  Settings,
  Mail,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import SidebarGroup from './SidebarGroup';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* ── Sidebar panel ──────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#0f1117]
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / brand */}
        <div className="bg-white border-b border-gray-200">
          {/* Logo area */}
          <div className="flex items-center justify-between px-4 py-4">
            <img
              src="https://res.cloudinary.com/dn2sab6qc/image/upload/v1773930131/repair-my-phone-screen-logo_jmngqv.webp"
              alt="RepairMyPhoneScreen"
              className="h-12 w-auto max-w-[175px] object-contain"
              draggable={false}
            />
            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
          <SidebarGroup label="Overview">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end onClick={onClose} />
          </SidebarGroup>

          <SidebarGroup label="Operations">
            <SidebarItem to="/orders"    icon={ShoppingBag} label="Orders"    onClick={onClose} />
            <SidebarItem to="/customers" icon={Users}       label="Customers" onClick={onClose} />
          </SidebarGroup>

          <SidebarGroup label="Catalogue">
            <SidebarItem to="/catalog"  icon={BookOpen}   label="Overview"  end onClick={onClose} />
            <SidebarItem to="/devices"  icon={Smartphone} label="Devices"   onClick={onClose} />
            <SidebarItem to="/brands"   icon={Layers}     label="Brands"    onClick={onClose} />
            <SidebarItem to="/series"   icon={GitBranch}  label="Series"    onClick={onClose} />
            <SidebarItem to="/models"   icon={Cpu}        label="Models"    onClick={onClose} />
          </SidebarGroup>

          <SidebarGroup label="Services">
            <SidebarItem to="/repairs"  icon={Wrench}  label="Repairs"  onClick={onClose} />
            <SidebarItem to="/addons"   icon={Package} label="Add-ons"  onClick={onClose} />
          </SidebarGroup>

          <SidebarGroup label="Forms">
            <SidebarItem to="/forms/newsletter" icon={Mail}          label="Newsletter" onClick={onClose} />
            <SidebarItem to="/forms/contact"    icon={MessageSquare} label="Contact Us"  onClick={onClose} />
            <SidebarItem to="/forms/warranty"   icon={ShieldCheck}   label="Warranty"    onClick={onClose} />
          </SidebarGroup>

          <SidebarGroup label="System">
            <SidebarItem to="/settings" icon={Settings} label="Settings" onClick={onClose} />
          </SidebarGroup>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/8 px-4 py-3">
          <p className="text-[10px] text-gray-600 text-center">
            © {new Date().getFullYear()} RepairMyPhoneScreen
          </p>
        </div>
      </aside>
    </>
  );
}
