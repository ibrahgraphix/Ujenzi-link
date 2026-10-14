import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <>
      <meta name="robots" content="noindex" />
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="text-8xl font-black text-[#2E86D8]">404</div>
            <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
            <p className="text-slate-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => onNavigate('home')}
              leftIcon={<Home className="w-4 h-4" />}
            >
              Back to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
