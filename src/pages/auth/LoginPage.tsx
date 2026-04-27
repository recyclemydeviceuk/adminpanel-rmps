import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

type Step = 'email' | 'otp';

export default function LoginPage() {
  const { sendOtp, verifyOtp } = useAuth();

  const [step, setStep]       = useState<Step>('email');
  const [email, setEmail]     = useState('');
  const [digits, setDigits]   = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Step 1: send OTP ──────────────────────────────────────── */
  const handleSendOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }

    setLoading(true);
    const result = await sendOtp(email.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Failed to send code.');
      return;
    }

    setStep('otp');
    startResendCooldown();
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  /* ── Step 2: verify OTP ────────────────────────────────────── */
  const handleVerifyOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length < 6) { setError('Please enter the full 6-digit code.'); return; }

    setLoading(true);
    const result = await verifyOtp(email.trim(), code);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Invalid or expired code.');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  /* ── OTP digit input handling ──────────────────────────────── */
  const handleDigitChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    setError('');
    if (v && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      // Auto-submit when all digits filled
      setTimeout(() => handleVerifyOtp(), 0);
    }
  };

  const handleDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) setTimeout(() => handleVerifyOtp(), 0);
  };

  /* ── Resend cooldown ───────────────────────────────────────── */
  const startResendCooldown = () => {
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setDigits(['', '', '', '', '', '']);
    setLoading(true);
    await sendOtp(email.trim());
    setLoading(false);
    startResendCooldown();
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  /* ── UI ────────────────────────────────────────────────────── */
  return (
    <div className="w-full rounded-[28px] bg-white px-8 py-9 shadow-[0_8px_40px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.04]">

      {/* Heading */}
      <div className="mb-8">
        {step === 'email' ? (
          <>
            <h2 className="text-[22px] font-bold tracking-tight text-[#111827]">Welcome back</h2>
            <p className="mt-1 text-[13.5px] text-[#6b7280]">Enter your email to receive a login code</p>
          </>
        ) : (
          <>
            <h2 className="text-[22px] font-bold tracking-tight text-[#111827]">Check your email</h2>
            <p className="mt-1 text-[13.5px] text-[#6b7280]">
              We sent a 6-digit code to <span className="font-semibold text-[#374151]">{email}</span>. It expires in 10 minutes.
            </p>
          </>
        )}
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

      {/* ── Step 1: Email form ── */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} noValidate className="space-y-4">
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
              autoFocus
              required
              className="w-full rounded-[14px] border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-[14px] text-[#111827] placeholder:text-[#9ca3af] outline-none transition-all duration-150 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
            />
          </div>

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
                Sending code…
              </>
            ) : (
              'Send login code'
            )}
          </button>
        </form>
      )}

      {/* ── Step 2: OTP form ── */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">

          {/* 6 digit boxes */}
          <div className="flex justify-between gap-2" onPaste={handleDigitPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleDigitKeyDown(i, e)}
                className="h-14 w-full rounded-[14px] border border-[#e5e7eb] bg-[#fafafa] text-center text-[22px] font-bold text-[#111827] outline-none transition-all duration-150 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || digits.join('').length < 6}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-red-600 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-all duration-150 hover:bg-red-700 hover:shadow-[0_6px_20px_rgba(220,38,38,0.40)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Verifying…
              </>
            ) : (
              'Verify & sign in'
            )}
          </button>

          {/* Back + resend */}
          <div className="flex items-center justify-between text-[13px]">
            <button
              type="button"
              onClick={() => { setStep('email'); setDigits(['', '', '', '', '', '']); setError(''); }}
              className="text-[#6b7280] hover:text-[#374151] transition-colors"
            >
              ← Change email
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <p className="mt-7 text-center text-[12px] text-[#9ca3af]">
        Secured &amp; encrypted access &mdash; RepairMyPhoneScreen
      </p>
    </div>
  );
}
