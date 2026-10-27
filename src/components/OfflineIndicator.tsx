import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
      <WifiOff className="h-3.5 w-3.5 animate-pulse" />
      <span>Mode Offline Aktif — Menggunakan data Al-Qur'an dan jadwal salat astronomis lokal.</span>
    </div>
  );
};
