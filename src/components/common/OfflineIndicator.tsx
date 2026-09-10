import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../utils/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-2"
    >
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Oflayn rejim — Saqlangan (keshlangan) ma'lumotlar ko'rsatilmoqda.</span>
    </div>
  );
};
