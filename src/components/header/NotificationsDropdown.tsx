import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, ShoppingBag, AlertCircle, Check, Wrench, CreditCard, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type NotificationType =
  | 'new_order'
  | 'payment_received'
  | 'payment_failed'
  | 'order_completed'
  | 'order_cancelled'
  | 'order_processing'
  | 'order_refunded';

interface Notification {
  _id:         string;
  type:        NotificationType;
  title:       string;
  message:     string;
  orderNumber?: string;
  read:        boolean;
  createdAt:   string;
}

interface NotificationsResponse {
  notifications: Notification[];
  total:         number;
  unreadCount:   number;
  page:          number;
  limit:         number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { Icon: typeof Bell; bg: string; color: string }> = {
  new_order:        { Icon: ShoppingBag,  bg: 'bg-blue-50',   color: 'text-blue-600'   },
  payment_received: { Icon: CreditCard,   bg: 'bg-green-50',  color: 'text-green-600'  },
  payment_failed:   { Icon: AlertCircle,  bg: 'bg-red-50',    color: 'text-red-600'    },
  order_completed:  { Icon: Check,        bg: 'bg-green-50',  color: 'text-green-600'  },
  order_cancelled:  { Icon: AlertCircle,  bg: 'bg-red-50',    color: 'text-red-600'    },
  order_processing: { Icon: Wrench,       bg: 'bg-amber-50',  color: 'text-amber-600'  },
  order_refunded:   { Icon: RefreshCw,    bg: 'bg-purple-50', color: 'text-purple-600' },
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 30_000; // 30 seconds

export default function NotificationsDropdown() {
  const [open, setOpen]                     = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [loading, setLoading]               = useState(false);
  const ref                                 = useRef<HTMLDivElement>(null);
  const pollRef                             = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch notifications from backend ───────────────────────────────────────
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<{ data: NotificationsResponse }>('/notifications?limit=30');
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch {
      // silently fail — don't crash the header
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(() => fetchNotifications(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchNotifications]);

  // Refresh immediately when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications(true);
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const markOneRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      fetchNotifications(true); // revert on error
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.patch('/notifications/read-all');
    } catch {
      fetchNotifications(true);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={ref} className="relative">

      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8eaed] bg-white text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] transition-colors duration-150"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[360px] rounded-2xl border border-[#e8eaed] bg-white shadow-xl animate-fade-in overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
            <div>
              <h3 className="text-[14px] font-semibold text-[#202124]">Notifications</h3>
              {unreadCount > 0
                ? <p className="text-[12px] text-[#5f6368]">{unreadCount} unread</p>
                : <p className="text-[12px] text-[#5f6368]">All caught up</p>
              }
            </div>
            <div className="flex items-center gap-2">
              {/* Refresh */}
              <button
                onClick={() => fetchNotifications()}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-[#9ca3af] hover:bg-gray-100 hover:text-[#374151] transition-colors ${loading ? 'animate-spin' : ''}`}
                aria-label="Refresh"
              >
                <RefreshCw size={13} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[12px] text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <Check size={12} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-[#f3f4f6]">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw size={18} className="animate-spin text-[#d1d5db]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell size={24} className="text-[#e5e7eb]" />
                <p className="text-[13px] text-[#9ca3af]">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg  = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.new_order;
                const Icon = cfg.Icon;
                return (
                  <div
                    key={n._id}
                    onClick={() => !n.read && markOneRead(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 ${
                      !n.read ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] font-medium truncate ${!n.read ? 'text-[#202124]' : 'text-[#5f6368]'}`}>
                          {n.title}
                        </p>
                        <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-[#6b7280] line-clamp-1">{n.message}</p>
                    </div>
                    {!n.read && (
                      <div className="flex-shrink-0 mt-1.5 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[#f3f4f6] px-4 py-2.5 text-center">
              <p className="text-[11px] text-[#9ca3af]">
                Showing latest {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
