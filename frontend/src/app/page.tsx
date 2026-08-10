"use client";

import React, { useState, useRef } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import Header from "../components/Header";
import InputPanel from "../components/InputPanel";
import StoredFiles from "../components/StoredFiles";
import TemperatureChart from "../components/TemperatureChart";
import InsightCards from "../components/InsightCards";
import LocationMap from "../components/LocationMap";
import { storeWeatherData, listWeatherFiles, getWeatherFileContent } from "../lib/api";
import { WeatherRequest } from "../lib/types";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [isStoring, setIsStoring] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // SWR for List
  const { data: filesData, mutate: refreshFiles, isValidating: listValidating } = useSWR(
    "listWeatherFiles",
    listWeatherFiles,
    { refreshInterval: 0, revalidateOnFocus: false }
  );

  // SWR for Content
  const { data: fileContent, isValidating: contentValidating } = useSWR(
    selectedFilename ? `fileContent-${selectedFilename}` : null,
    () => getWeatherFileContent(selectedFilename!),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const handleFetchData = async (payload: WeatherRequest, locationName: string) => {
    setIsStoring(true);
    const toastId = toast.loading(`Fetching data for ${locationName}...`);
    try {
      const res = await storeWeatherData(payload);
      if (res?.status === "ok") {
        toast.success(`Data saved: ${res.file}`, { id: toastId });
        await refreshFiles(); 
        handleSelectFile(res.file);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${errorMsg}`, { id: toastId });
    } finally {
      setIsStoring(false);
    }
  };

  const handleSelectFile = (filename: string) => {
    setSelectedFilename(filename);
    setTimeout(() => {
      chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white selection:bg-blue-500/30 overflow-x-hidden relative">
      <Toaster theme="dark" position="bottom-right" className="font-sans" />
      
      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Bento Grid Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-5 h-full">
            <InputPanel 
              onFetch={handleFetchData} 
              isLoading={isStoring}
            />
          </div>

          {/* Stored Files List */}
          <div className="lg:col-span-7 h-full">
            <StoredFiles 
              files={filesData?.files || []} 
              onRefresh={refreshFiles}
              onSelect={handleSelectFile}
              selectedFile={selectedFilename}
              isValidating={listValidating}
            />
          </div>
        </div>

        {/* Dynamic Visualization Section */}
        <div ref={chartRef} className="scroll-mt-8">
          <AnimatePresence mode="wait">
            {selectedFilename && (
              <motion.div 
                key={selectedFilename}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                {contentValidating && !fileContent ? (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Analyzing dataset...</p>
                  </div>
                ) : fileContent ? (
                  <>
                    <InsightCards data={fileContent.daily} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <TemperatureChart data={fileContent.daily} filename={selectedFilename} />
                      </div>
                      <div className="lg:col-span-1">
                        <LocationMap 
                          latitude={fileContent.latitude} 
                          longitude={fileContent.longitude} 
                          locationName="Queried Location" 
                        />
                      </div>
                    </div>
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
