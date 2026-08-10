"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Leaflet relies on window, so we must dynamically import the map components
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

interface LocationMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

export default function LocationMap({ latitude, longitude, locationName }: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    setIsMounted(true);
    // Fix Leaflet marker icons in Next.js
    import("leaflet").then(L => {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[300px] bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  // We use CartoDB Dark Matter tiles for the dark theme
  return (
    <div className="w-full h-full min-h-[300px] bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
      <MapContainer 
        key={`${latitude}-${longitude}`} // Force re-render on coordinate change
        center={[latitude, longitude]} 
        zoom={6} 
        scrollWheelZoom={false}
        className="w-full h-full z-0 absolute inset-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup className="text-black font-semibold">
            {locationName}
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
