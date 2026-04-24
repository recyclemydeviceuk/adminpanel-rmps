import { useNavigate, useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Package, CreditCard, Calendar, Clock, CheckCircle2, RefreshCw, Printer, StickyNote, Send, ArrowLeft, User, Mail, Phone, Wrench, PoundSterling, AlertTriangle, RotateCcw, ChevronDown, Lock, ShieldCheck, Truck, Home, Box } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useOrder } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';
import OrderItemsTable from './components/OrderItemsTable';
import { formatDateTime } from '../../lib/dates';
import { formatCurrency } from '../../lib/currency';
import { getOrderNotes, addOrderNote } from '../../lib/orders';
import type { OrderStatus } from '../../types/order';

const TIMELINE_STEPS: OrderStatus[] = ['pending', 'paid', 'processing', 'completed'];

const STATUS_META: Record<string, { label: string; gradient: string; softBg: string; border: string; textColor: string; dot: string }> = {
  pending:    { label: 'Pending',    gradient: 'from-amber-400 to-orange-400',  softBg: 'bg-amber-50',   border: 'border-amber-200',  textColor: 'text-amber-700',   dot: 'bg-amber-400' },
  paid:       { label: 'Paid',       gradient: 'from-blue-500 to-indigo-500',   softBg: 'bg-blue-50',    border: 'border-blue-200',   textColor: 'text-blue-700',    dot: 'bg-blue-400' },
  processing: { label: 'Processing', gradient: 'from-violet-500 to-purple-500', softBg: 'bg-violet-50',  border: 'border-violet-200', textColor: 'text-violet-700',  dot: 'bg-violet-400' },
  completed:  { label: 'Completed',  gradient: 'from-emerald-400 to-green-500', softBg: 'bg-emerald-50', border: 'border-emerald-200',textColor: 'text-emerald-700', dot: 'bg-emerald-500' },
  failed:     { label: 'Failed',     gradient: 'from-red-500 to-rose-500',      softBg: 'bg-red-50',     border: 'border-red-200',    textColor: 'text-red-700',     dot: 'bg-red-500' },
  refunded:   { label: 'Refunded',   gradient: 'from-orange-400 to-amber-500',  softBg: 'bg-orange-50',  border: 'border-orange-200', textColor: 'text-orange-700',  dot: 'bg-orange-400' },
  cancelled:  { label: 'Cancelled',  gradient: 'from-gray-400 to-gray-500',     softBg: 'bg-gray-50',    border: 'border-gray-200',   textColor: 'text-gray-600',    dot: 'bg-gray-400' },
};

const PAYMENT_META: Record<string, string> = {
  paid:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  unpaid:   'bg-amber-50 text-amber-700 border border-amber-200',
  refunded: 'bg-orange-50 text-orange-700 border border-orange-200',
};

function avatarColor(name: string) {
  const colors = ['bg-red-500','bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, loading, error, updateStatus } = useOrder(orderId ?? '');
  const { success, error: toastError } = useToast();

  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<{ text: string; time: string }[]>([]);
  const [savingNote, setSavingNote] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load internal notes from the backend when the order is ready
  useEffect(() => {
    if (!orderId) return;
    setNotesLoading(true);
    getOrderNotes(orderId)
      .then(notes => setSavedNotes(
        notes.map(n => ({ text: n.text, time: new Date(n.createdAt).toLocaleString('en-GB') }))
      ))
      .catch(() => {})
      .finally(() => setNotesLoading(false));
  }, [orderId]);

  const handleStatus = async (status: OrderStatus) => {
    try {
      await updateStatus(status);
      success('Status updated', `Order changed to ${status}.`);
    } catch {
      toastError('Failed to update status.');
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim() || !orderId) return;
    setSavingNote(true);
    try {
      const updated = await addOrderNote(orderId, note.trim());
      setSavedNotes(updated.map(n => ({ text: n.text, time: new Date(n.createdAt).toLocaleString('en-GB') })));
      setNote('');
      success('Note saved');
    } catch {
      toastError('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handlePrint = () => {
    if (!order) return;
    const html = `<html><head><title>Invoice ${order.orderNumber}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#202124}h1{color:#dc2626}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #e8eaed;padding:10px 12px;text-align:left}th{background:#f8f9fa;font-size:12px;text-transform:uppercase}tfoot td{font-weight:bold}</style>
      </head><body>
      <h1>Invoice — ${order.orderNumber}</h1>
      <p>Customer: <strong>${order.customerName}</strong> · ${order.customerEmail}</p>
      <p>Device: <strong>${order.device}</strong> · Repair: ${order.repairType}</p>
      <table><thead><tr><th>Service</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
      <tbody>${order.items.map(i=>`<tr><td>${i.repairType}</td><td>${i.quantity}</td><td>£${i.unitPrice.toFixed(2)}</td><td>£${i.totalPrice.toFixed(2)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3">Total</td><td><strong>£${order.total.toFixed(2)}</strong></td></tr></tfoot>
      </table></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  if (error || !order) return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <p className="text-[#202124] font-semibold">Order not found</p>
      <p className="text-[13px] text-[#5f6368]">{error ?? 'The requested order does not exist.'}</p>
    </div>
  );

  const statusMeta   = STATUS_META[order.status] ?? STATUS_META.pending;
  const currentStep  = TIMELINE_STEPS.indexOf(order.status as OrderStatus);
  const isTerminal   = ['failed', 'refunded', 'cancelled'].includes(order.status);

  return (
    <div className="space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/orders')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Orders
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="font-mono text-[12px] font-bold text-[#202124]">{order.orderNumber}</span>
      </div>

      {/* Hero header */}
      <div className="relative rounded-2xl border border-[#e8eaed] bg-white shadow-sm">
        <div className={`h-1.5 w-full rounded-t-2xl bg-gradient-to-r ${statusMeta.gradient}`} />

        <div className="flex items-center justify-between gap-6 px-6 py-5 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-mono text-[22px] font-black text-[#202124] tracking-tight">{order.orderNumber}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusMeta.softBg} ${statusMeta.border} ${statusMeta.textColor}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${PAYMENT_META[order.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[#9aa0a6]">Created {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
              <Printer size={13} /> Print Invoice
            </button>
            {/* Status dropdown inline in header */}
            {(() => {
              const STATUS_OPTS = [
                { status: 'processing' as OrderStatus, label: 'Mark Processing', gradient: 'from-violet-500 to-purple-600', textColor: 'text-violet-700', softBg: 'bg-violet-50' },
                { status: 'completed'  as OrderStatus, label: 'Mark Completed',  gradient: 'from-emerald-400 to-green-500', textColor: 'text-emerald-700', softBg: 'bg-emerald-50' },
                { status: 'failed'     as OrderStatus, label: 'Mark Failed',     gradient: 'from-red-500 to-rose-500',      textColor: 'text-red-700',     softBg: 'bg-red-50' },
                { status: 'refunded'   as OrderStatus, label: 'Refund Order',    gradient: 'from-orange-400 to-amber-500',  textColor: 'text-orange-700',  softBg: 'bg-orange-50' },
              ];
              const current = STATUS_OPTS.find(o => o.status === order.status) ?? STATUS_OPTS[0];
              return (
                <div ref={statusRef} className="relative">
                  <button
                    onClick={() => setStatusOpen(p => !p)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all ${
                      statusOpen ? 'border-transparent ring-2 ring-red-400 bg-white shadow-md' : 'border-[#e8eaed] bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${current.gradient}`} />
                    <span className="text-[#202124]">{current.label}</span>
                    <ChevronDown size={13} className={`text-[#9aa0a6] transition-transform duration-200 ${statusOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-[#e8eaed] bg-white shadow-2xl shadow-black/10">
                      <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-4 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aa0a6]">Select new status</p>
                      </div>
                      <div className="p-2">
                        {STATUS_OPTS.map(opt => {
                          const isCurrentStatus = opt.status === order.status;
                          return (
                            <button key={opt.status} disabled={isCurrentStatus}
                              onClick={() => { handleStatus(opt.status); setStatusOpen(false); }}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                                isCurrentStatus ? `${opt.softBg} cursor-default` : 'hover:bg-gray-50'
                              }`}>
                              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${opt.gradient} shadow-sm`}>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
                              </div>
                              <p className={`text-[12px] font-bold flex-1 ${isCurrentStatus ? opt.textColor : 'text-[#202124]'}`}>{opt.label}</p>
                              {isCurrentStatus && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${opt.softBg} ${opt.textColor}`}>Now</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Order Total',   display: formatCurrency(order.total),      gradient: 'from-emerald-400 to-green-500',  glow: 'shadow-green-100',   icon: PoundSterling },
          { label: 'Items',         display: String(order.items.length),        gradient: 'from-blue-500 to-indigo-500',    glow: 'shadow-blue-100',    icon: Package },
          { label: 'Device',        display: order.device,                      gradient: 'from-violet-500 to-purple-500',  glow: 'shadow-purple-100',  icon: Wrench },
          { label: 'Repair Type',   display: order.repairType,                  gradient: 'from-red-500 to-rose-500',       glow: 'shadow-red-100',     icon: Wrench },
        ].map(s => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border border-[#e8eaed] bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${s.glow}`}>
            <div className={`h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.07]`} />
            <div className="p-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-sm`}>
                <s.icon size={16} className="text-white" />
              </div>
              <p className="text-[18px] font-black text-[#202124] leading-tight tracking-tight truncate">{s.display}</p>
              <p className="mt-1 text-[11px] font-semibold text-[#9aa0a6] uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {!isTerminal ? (
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <RefreshCw size={13} className="text-[#5f6368]" />
            <span className="text-[13px] font-bold text-[#202124]">Order Progress</span>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center">
              {TIMELINE_STEPS.map((step, idx) => {
                const isDone    = currentStep > idx;
                const isCurrent = currentStep === idx;
                const isLast    = idx === TIMELINE_STEPS.length - 1;
                const meta      = STATUS_META[step];
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all shadow-sm ${
                        isDone    ? 'border-emerald-500 bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-green-200' :
                        isCurrent ? `bg-gradient-to-br ${meta.gradient} text-white shadow-md border-transparent` :
                                    'border-gray-200 bg-white text-[#d1d5db]'
                      }`}>
                        {isDone ? <CheckCircle2 size={16} /> : step === 'pending' ? <Clock size={16} /> : step === 'paid' ? <CreditCard size={16} /> : step === 'processing' ? <RefreshCw size={16} /> : <CheckCircle2 size={16} />}
                      </div>
                      <span className={`text-[10px] font-bold capitalize whitespace-nowrap ${
                        isDone ? 'text-emerald-600' : isCurrent ? meta.textColor : 'text-[#d1d5db]'
                      }`}>{step}</span>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-1 mx-2 mb-5 rounded-full ${isDone ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gray-100'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${statusMeta.softBg} ${statusMeta.border}`}>
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${statusMeta.gradient} shadow-sm`}>
            {order.status === 'refunded' ? <RotateCcw size={16} className="text-white" /> : <AlertTriangle size={16} className="text-white" />}
          </div>
          <div>
            <p className={`text-[13px] font-bold capitalize ${statusMeta.textColor}`}>Order {order.status}</p>
            <p className="text-[12px] text-[#5f6368]">
              {order.status === 'refunded'  ? 'This order has been refunded to the customer.' :
               order.status === 'cancelled' ? 'This order was cancelled.' :
               'This order has failed. Review and take action if needed.'}
            </p>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left: items + notes */}
        <div className="xl:col-span-2 space-y-5">

          {/* Order items */}
          <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
              <Package size={13} className="text-[#5f6368]" />
              <span className="text-[13px] font-bold text-[#202124]">Order Items</span>
              <span className="ml-auto rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-[#5f6368]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="p-5">
              <OrderItemsTable items={order.items} subtotal={order.subtotal} discount={order.discount} total={order.total} />
            </div>
          </div>

          {/* Internal notes */}
          <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
              <StickyNote size={13} className="text-[#5f6368]" />
              <span className="text-[13px] font-bold text-[#202124]">Internal Notes</span>
              <span className="ml-2 text-[11px] text-[#9aa0a6]">Visible only to staff</span>
            </div>
            <div className="p-5 space-y-3">
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add a note about this order (e.g. part ordered, customer called)..."
                className="w-full rounded-xl border border-[#e8eaed] bg-[#fcfcfd] px-4 py-3 text-[13px] text-[#202124] resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder:text-[#c4c9d0]" />
              <div className="flex justify-end">
                <button onClick={handleSaveNote} disabled={!note.trim() || savingNote}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <Send size={12} /> {savingNote ? 'Saving…' : 'Save Note'}
                </button>
              </div>

              {order.notes && (
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                  <StickyNote size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-1">Original Note</p>
                    <p className="text-[12px] text-amber-800">{order.notes}</p>
                  </div>
                </div>
              )}

              {notesLoading && (
                <p className="text-[12px] text-[#9aa0a6] text-center py-2">Loading notes…</p>
              )}

              {!notesLoading && savedNotes.length > 0 && (
                <div className="space-y-2">
                  {savedNotes.map((n, i) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
                      <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-200 text-[10px] font-black text-blue-700 mt-0.5">{savedNotes.length - i}</div>
                      <div>
                        <p className="text-[10px] font-semibold text-blue-500 mb-1">{n.time}</p>
                        <p className="text-[12px] text-blue-800">{n.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Customer card */}
          <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
              <User size={13} className="text-[#5f6368]" />
              <span className="text-[13px] font-bold text-[#202124]">Customer</span>
            </div>
            <div className="p-4 space-y-3">
              <button onClick={() => navigate(`/customers/${order.customerId}`)}
                className="flex items-center gap-3 w-full rounded-xl hover:bg-gray-50 p-1 transition-colors group">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white text-[14px] font-black ${avatarColor(order.customerName)}`}>
                  {order.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[13px] font-bold text-[#202124] group-hover:text-red-600 transition-colors truncate">{order.customerName}</p>
                  <p className="text-[10px] text-[#9aa0a6]">View customer profile →</p>
                </div>
              </button>
              <a href={`mailto:${order.customerEmail}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-[12px] text-[#5f6368] hover:bg-red-50 hover:text-red-600 transition-all group">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#e8eaed] bg-white group-hover:border-red-200">
                  <Mail size={11} className="text-[#9aa0a6] group-hover:text-red-500" />
                </div>
                <span className="truncate font-medium">{order.customerEmail}</span>
              </a>
              <a href={`tel:${order.customerPhone}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-[12px] text-[#5f6368] hover:bg-red-50 hover:text-red-600 transition-all group">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#e8eaed] bg-white group-hover:border-red-200">
                  <Phone size={11} className="text-[#9aa0a6] group-hover:text-red-500" />
                </div>
                <span className="font-medium font-mono">{order.customerPhone}</span>
              </a>
            </div>
          </div>

          {/* Order details */}
          <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
              <Package size={13} className="text-[#5f6368]" />
              <span className="text-[13px] font-bold text-[#202124]">Order Details</span>
            </div>
            <div className="divide-y divide-[#f8fafc]">
              {[
                { label: 'Device',          value: order.device,                    icon: Package },
                { label: 'Payment Method',  value: order.paymentMethod,             icon: CreditCard },
                { label: 'Last Updated',    value: formatDateTime(order.updatedAt), icon: Calendar },
                ...(order.completedAt ? [{ label: 'Completed At', value: formatDateTime(order.completedAt), icon: CheckCircle2 }] : []),
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <item.icon size={12} className="text-[#9aa0a6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aa0a6]">{item.label}</p>
                    <p className="text-[13px] font-semibold text-[#202124] mt-0.5 capitalize truncate">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Payment Status — locked, auto-managed by PayPal webhook */}
              <div className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <ShieldCheck size={12} className="text-[#9aa0a6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aa0a6]">Payment Status</p>
                      <div className="flex items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-0.5">
                        <Lock size={8} className="text-[#9aa0a6]" />
                        <span className="text-[9px] font-bold text-[#9aa0a6]">Auto</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold capitalize border ${PAYMENT_META[order.paymentStatus] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {order.paymentStatus === 'paid'     && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                        {order.paymentStatus === 'unpaid'   && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                        {order.paymentStatus === 'refunded' && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                        {order.paymentStatus}
                      </span>
                      <span className="text-[10px] text-[#9aa0a6]">via PayPal</span>
                    </div>
                    <p className="mt-1.5 text-[10px] text-[#9aa0a6]">
                      Automatically updated by PayPal — cannot be changed manually.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Postage */}
          {order.postageType && (() => {
            const META: Record<string, { label: string; description: string; icon: any; tint: string }> = {
              'print-label':   { label: 'Print Our Label',     description: 'Customer prints a prepaid label at home.',              icon: Printer, tint: 'text-blue-600 bg-blue-50' },
              'send-pack':     { label: 'Send a Pack From Us', description: 'We post a prepaid packaging kit to the customer.',     icon: Box,     tint: 'text-indigo-600 bg-indigo-50' },
              'send-your-own': { label: 'Send Your Own',       description: 'Customer posts the device using their own courier.',   icon: Home,    tint: 'text-emerald-600 bg-emerald-50' },
            };
            const m = META[order.postageType] ?? { label: order.postageType, description: '', icon: Truck, tint: 'text-gray-600 bg-gray-50' };
            const Icon = m.icon;
            return (
              <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
                  <Truck size={13} className="text-[#5f6368]" />
                  <span className="text-[13px] font-bold text-[#202124]">Postage</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${m.tint}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#202124]">{m.label}</p>
                      <p className="text-[11px] text-[#9aa0a6] mt-0.5">{m.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Total summary */}
          <div className="rounded-2xl border border-[#e8eaed] overflow-hidden shadow-sm bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/50 mb-3">Order Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[12px] text-white/60">
                  <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[12px] text-emerald-400">
                    <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[18px] font-black text-white border-t border-white/10 pt-2 mt-1">
                  <span>Total</span><span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
