import React from "react";
import { CloudRain } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg shadow-lg shadow-blue-500/20">
            <CloudRain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Weather Explorer
            </h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              INRISK LABS
            </p>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
            Climate Risk Platform
          </span>
        </div>
      </div>
    </header>
  );
}
