import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9] px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
          <AlertTriangle size={36} className="text-red-500" />
        </div>

        <p className="text-[80px] font-black text-[#e8eaed] leading-none select-none">404</p>

        <h1 className="mt-2 text-[24px] font-bold text-[#202124]">Page not found</h1>
        <p className="mt-3 text-[14px] text-[#5f6368] leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Please check the URL or
          return to the dashboard.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Home size={16} />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
