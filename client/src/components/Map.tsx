import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: any) => void;
}

export function MapView({
  className,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainer.current) {
      mapContainer.current.innerHTML = '<div class="flex items-center justify-center h-full bg-slate-100 text-slate-400">Mapa desativado nesta versão</div>';
    }
  }, []);

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}
