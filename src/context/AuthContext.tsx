import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import api from '../lib/api';

/* ── Types ──────────────────────────────────────────────────── */
export interface AdminUser {
  id:     string;
  name:   string;
  email:  string;
  avatar?: string;
}

interface AuthState {
  user:            AdminUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
}

interface AuthContextValue extends AuthState {
  sendOtp:   (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout:    () => void;
}

/* ── Storage keys ─────────────────────────────────────────────── */
const TOKEN_KEY = 'admin_token';
const USER_KEY  = 'admin_user';

/* ── Context ──────────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:            null,
    isAuthenticated: false,
    isLoading:       true,
  });

  /* Rehydrate from localStorage + verify token on mount */
  useEffect(() => {
    const token  = localStorage.getItem(TOKEN_KEY);
    const stored = localStorage.getItem(USER_KEY);

    if (!token || !stored) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    api
      .get<{ data: { _id: string; name: string; email: string } }>('/auth/profile')
      .then((res) => {
        const admin = res.data.data;
        const user: AdminUser = { id: admin._id, name: admin.name, email: admin.email };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState({ user, isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      });
  }, []);

  /* Step 1 — request OTP */
  const sendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post('/auth/send-otp', { email });
      return { success: true };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to send code. Please try again.';
      return { success: false, error: msg };
    }
  };

  /* Step 2 — verify OTP and store JWT */
  const verifyOtp = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.post<{
        data: {
          token: string;
          admin: { _id: string; name: string; email: string };
        };
      }>('/auth/verify-otp', { email, code });

      const { token, admin } = res.data.data;
      const user: AdminUser = { id: admin._id, name: admin.name, email: admin.email };

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid or expired code.';
      return { success: false, error: msg };
    }
  };

  /* Logout */
  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────── */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
