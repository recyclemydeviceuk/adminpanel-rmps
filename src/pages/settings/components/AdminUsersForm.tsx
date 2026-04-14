import { useState } from 'react';
import { Trash2, Shield, X, Loader2, UserPlus } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

interface AdminUserEntry {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'support';
  createdAt: string;
}

const ROLE_STYLE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'super-admin': { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  'admin':       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  'support':     { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400' },
};

const AVATAR_GRAD: Record<string, string> = {
  'super-admin': 'from-red-500 to-rose-600',
  'admin':       'from-blue-500 to-indigo-600',
  'support':     'from-slate-500 to-slate-600',
};

const INITIAL_USERS: AdminUserEntry[] = [
  { id: 'admin-001', name: 'Super Admin',   email: 'admin@repairmyphonescreen.co.uk',   role: 'super-admin', createdAt: '2023-01-01T00:00:00Z' },
  { id: 'admin-002', name: 'Support Agent', email: 'support@repairmyphonescreen.co.uk', role: 'support',     createdAt: '2023-06-01T00:00:00Z' },
];

const inputCls = "w-full rounded-xl border border-[#e8eaed] bg-[#fafbfc] px-3.5 py-2.5 text-[13px] text-[#202124] placeholder:text-[#c5c9ce] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all";

export default function AdminUsersForm() {
  const [users, setUsers]         = useState<AdminUserEntry[]>(INITIAL_USERS);
  const [showForm, setShowForm]   = useState(false);
  const [newName, setNewName]     = useState('');
  const [newEmail, setNewEmail]   = useState('');
  const [newRole, setNewRole]     = useState<AdminUserEntry['role']>('support');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving]       = useState(false);
  const { success, error: toastError } = useToast();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    setUsers(prev => [...prev, { id: `admin-${Date.now()}`, name: newName, email: newEmail, role: newRole, createdAt: new Date().toISOString() }]);
    success(`${newName} added`);
    setSaving(false);
    setShowForm(false);
    setNewName(''); setNewEmail(''); setNewRole('support'); setNewPassword('');
  };

  const handleDelete = (user: AdminUserEntry) => {
    if (user.role === 'super-admin') { toastError('Cannot delete super admin.'); return; }
    if (!confirm(`Remove "${user.name}"?`)) return;
    setUsers(prev => prev.filter(u => u.id !== user.id));
    success('User removed');
  };

  return (
    <div className="space-y-5">

      {/* Users list */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-[#e8eaed] flex items-center justify-between">
          <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Admin Users</p>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{users.length} users</span>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {users.map(user => {
            const rs = ROLE_STYLE[user.role];
            const ag = AVATAR_GRAD[user.role];
            const roleLabel = user.role === 'super-admin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1);
            return (
              <div key={user.id} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#fafbfc] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ag} text-white text-[13px] font-black shadow-sm`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#202124] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#9aa0a6] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${rs.bg} ${rs.text} ${rs.border}`}>
                    <Shield size={9} />
                    {roleLabel}
                  </span>
                  {user.role !== 'super-admin' && (
                    <button onClick={() => handleDelete(user)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add user inline form */}
      {showForm ? (
        <form onSubmit={handleAdd} className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] font-bold text-[#202124]">Add New Admin User</p>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-[#9aa0a6] transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Full Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Jane Smith" required className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@example.com" required className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Temporary Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value as AdminUserEntry['role'])}
                className={inputCls}>
                <option value="support">Support</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl border border-[#e8eaed] px-4 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-[12px] font-bold text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 transition-all">
              {saving ? <><Loader2 size={12} className="animate-spin" />Adding…</> : <>Add User</>}
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-[13px] font-semibold text-blue-600 hover:bg-blue-100 hover:border-blue-400 transition-all w-full justify-center">
          <UserPlus size={15} /> Add Admin User
        </button>
      )}
    </div>
  );
}
