import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-sm text-gray-400 animate-pulse">{message}</p>
    </div>
  );
}
