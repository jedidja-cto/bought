import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center animate-in slide-in-from-top duration-300">
      <WifiOff className="h-4 w-4 mr-2" />
      You are currently offline. Some features may be unavailable.
    </div>
  );
}
