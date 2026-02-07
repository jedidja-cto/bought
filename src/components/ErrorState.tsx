import React from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorState({ 
  title = "Connection Issue", 
  message = "We couldn't connect to the server. Please check your internet connection and try again.", 
  onRetry,
  fullPage = false
}: ErrorStateProps) {
  const Content = () => (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <WifiOff className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Connection
        </button>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Content />
      </div>
    );
  }

  return <Content />;
}
