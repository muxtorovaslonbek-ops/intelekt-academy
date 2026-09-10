import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

interface NotFoundViewProps {
  onNavigate?: (page: string) => void;
  onRouteChange?: (route: any) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate, onRouteChange }) => {
  const handleHome = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    }
    if (onRouteChange) {
      onRouteChange('dashboard');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="relative inline-block">
          <h1 className="text-9xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <div className="absolute inset-0 blur-2xl bg-indigo-500/10 -z-10 rounded-full" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sahifa Topilmadi
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Siz qidirayotgan sahifa o'chirilgan, nomi o'zgargan yoki vaqtincha mavjud emas.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleHome}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Bosh Sahifaga Qaytish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
