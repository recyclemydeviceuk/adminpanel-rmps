import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9fafb] flex items-center justify-center px-4">

      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-100/60 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-red-50/80 blur-[120px]" />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top red accent line */}
      <div className="fixed inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-red-400" />

      {/* Card container */}
      <div className="relative z-10 w-full max-w-[400px]">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="https://res.cloudinary.com/dn2sab6qc/image/upload/v1773930131/repair-my-phone-screen-logo_jmngqv.webp"
            alt="RepairMyPhoneScreen"
            className="h-16 w-auto object-contain"
          />
        </div>

        <Outlet />
      </div>
    </div>
  );
}
