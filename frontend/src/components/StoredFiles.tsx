"use client";

import React, { useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { FolderOpen, RefreshCw, FileJson } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WeatherFileInfo } from "../lib/types";

interface StoredFilesProps {
  files: WeatherFileInfo[];
  onRefresh: () => void;
  onSelect: (filename: string) => void;
  selectedFile: string | null;
  isValidating: boolean;
}

export default function StoredFiles({ files, onRefresh, onSelect, selectedFile, isValidating }: StoredFilesProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onRefresh(); }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            Saved Datasets
          </h2>
          <p className="text-xs text-gray-400 mt-1">{files.length} files stored</p>
        </div>
        <button 
          suppressHydrationWarning
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-white bg-black/40 hover:bg-black/60 rounded-xl transition-colors border border-white/5"
        >
          <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto -mx-2 px-2 relative z-10 scrollbar-thin">
        {files.length === 0 && !isValidating ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="p-4 rounded-full bg-white/5">
              <FileJson className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 font-medium">No datasets found.<br/>Search a location to begin.</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            <AnimatePresence>
              {files.map((file) => (
                <motion.button
                  variants={item}
                  layout
                  key={file.name}
                  onClick={() => onSelect(file.name)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group
                    ${selectedFile === file.name 
                      ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${selectedFile === file.name ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-gray-200'}`}>
                    <FileJson className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors ${selectedFile === file.name ? 'text-blue-100' : 'text-gray-200'}`} title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 font-mono">
                      <span>{formatSize(file.size)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                      <span title={file.created_at}>
                        {formatDistanceToNow(parseISO(file.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
