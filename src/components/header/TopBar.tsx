import { Menu, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown';
import AdminProfileDropdown from './AdminProfileDropdown';

/* Map routes → readable page titles */
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':      'Dashboard',
  '/orders':         'Orders',
  '/customers':      'Customers',
  '/catalog':        'Catalogue Overview',
  '/devices':        'Devices',
  '/brands':         'Brands',
  '/series':         'Series',
  '/models':         'Models',
  '/repairs':        'Repairs',
  '/pricing':        'Pricing',
  '/addons':         'Add-ons',
  '/analytics':      'Analytics',
  '/content':        'Content',
  '/content/faqs':   'FAQs Manager',
  '/content/banners':'Banner Manager',
  '/settings':       'Settings',
};

function getPageTitle(pathname: string): string {
  // Try exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Try prefix match (e.g. /orders/123 → Orders)
  const segment = '/' + pathname.split('/')[1];
  return PAGE_TITLES[segment] ?? 'Admin Panel';
}

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#e8eaed] bg-white px-4 md:px-6">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] transition-colors duration-150 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={17} />
        </button>

        <div>
          <h1 className="text-[16px] font-bold text-[#202124] leading-none">{title}</h1>
          <p className="text-[11px] text-[#5f6368] mt-0.5 hidden sm:block">
            RepairMyPhoneScreen Admin
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Visit main site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-medium text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] transition-colors duration-150"
        >
          <ExternalLink size={13} />
          View Site
        </a>

        <NotificationsDropdown />
        <AdminProfileDropdown />
      </div>
    </header>
  );
}
