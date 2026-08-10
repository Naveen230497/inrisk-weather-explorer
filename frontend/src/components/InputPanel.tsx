"use client";

import React, { useState, useEffect, useRef } from "react";
import { format, subDays, isAfter, differenceInDays } from "date-fns";
import { Loader2, Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WeatherRequest } from "../lib/types";
import { searchLocation, GeocodeResult } from "../lib/geocoding";
import { toast } from "sonner";

interface InputPanelProps {
  onFetch: (data: WeatherRequest, locationName: string) => Promise<void>;
  isLoading: boolean;
}

export default function InputPanel({ onFetch, isLoading }: InputPanelProps) {
  const today = new Date();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    latitude: 52.52,
    longitude: 13.41,
    locationName: "Berlin", // Default location
    start_date: format(subDays(today, 7), "yyyy-MM-dd"),
    end_date: format(today, "yyyy-MM-dd"),
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const data = await searchLocation(query);
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectLocation = (loc: GeocodeResult) => {
    setFormData(prev => ({
      ...prev,
      latitude: loc.latitude,
      longitude: loc.longitude,
      locationName: loc.name
    }));
    setQuery(loc.name);
    setShowDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    
    if (isAfter(start, end)) {
      toast.error("Start date must be before or equal to end date.");
      return;
    }
    if (differenceInDays(end, start) > 31) {
      toast.error("Date range must not exceed 31 days on free tier.");
      return;
    }
    if (isAfter(end, today)) {
      toast.error("Dates cannot be in the future.");
      return;
    }
    
    onFetch({
      latitude: formData.latitude,
      longitude: formData.longitude,
      start_date: formData.start_date,
      end_date: formData.end_date
    }, formData.locationName);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-visible"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
          <Search className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Fetch Data</h2>
          <p className="text-sm text-gray-400">Search globally via Open-Meteo</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Semantic City Search */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <input 
              suppressHydrationWarning
              type="text" 
              placeholder="Search for a city (e.g., Tokyo)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner"
            />
            {isSearching && (
              <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-blue-400 animate-spin" />
            )}
          </div>
          
          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showDropdown && results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-[#0f111a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
              >
                {results.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{loc.name}</p>
                      <p className="text-xs text-gray-500">{loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-600 font-mono">LAT: {loc.latitude.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-600 font-mono">LON: {loc.longitude.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Readonly Lat/Lon displays (hidden input but shows to user what's selected) */}
        {formData.locationName && !query && (
          <div className="flex gap-4 text-xs font-mono text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex-1">Target: <span className="text-gray-200">{formData.locationName}</span></div>
            <div>{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Start Date</label>
            <input 
              type="date" 
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              max={format(today, "yyyy-MM-dd")}
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">End Date</label>
            <input 
              type="date" 
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              max={format(today, "yyyy-MM-dd")}
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]"
            />
          </div>
        </div>
        
        <button
          suppressHydrationWarning
          type="submit"
          disabled={isLoading}
          className="w-full relative mt-2 overflow-hidden rounded-xl p-[1px] group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-70 group-hover:opacity-100 transition-opacity bg-[length:200%_auto] animate-gradient"></span>
          <div className="relative bg-black/60 backdrop-blur-md flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors group-hover:bg-black/40">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            ) : (
              <span className="text-sm font-semibold text-white tracking-wide">Fetch & Store Data</span>
            )}
          </div>
        </button>
      </form>
    </motion.div>
  );
}
