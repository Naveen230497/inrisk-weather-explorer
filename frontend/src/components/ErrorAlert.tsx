import React from "react";
import { AlertCircle, X, RotateCcw } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onDismiss, onRetry }: ErrorAlertProps) {
  return (
    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 relative flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-3 flex-1">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-200">{message}</p>
      </div>
      
      <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-300 hover:text-white bg-red-500/20 hover:bg-red-500/40 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Retry
          </button>
        )}
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="p-1.5 text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
