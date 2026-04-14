import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Invalid email or password.');
    }
  };

  return (
    <div className="w-full rounded-[28px] bg-white px-8 py-9 shadow-[0_8px_40px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.04]">

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-[22px] font-bold tracking-tight text-[#111827]">Welcome back</h2>
        <p className="mt-1 text-[13.5px] text-[#6b7280]">Sign in to your admin account</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
            <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
              <path d="M6 3v3M6 8.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <p className="text-[13px] font-medium text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[13px] font-semibold text-[#374151]">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full rounded-[14px] border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-[14px] text-[#111827] placeholder:text-[#9ca3af] outline-none transition-all duration-150 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-[13px] font-semibold text-[#374151]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full rounded-[14px] border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 pr-11 text-[14px] text-[#111827] placeholder:text-[#9ca3af] outline-none transition-all duration-150 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              tabIndex={-1}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[#9ca3af] transition-colors hover:text-[#6b7280]"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-[14px] bg-red-600 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-all duration-150 hover:bg-red-700 hover:shadow-[0_6px_20px_rgba(220,38,38,0.40)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-7 text-center text-[12px] text-[#9ca3af]">
        Secured &amp; encrypted access &mdash; RepairMyPhoneScreen
      </p>
    </div>
  );
}
