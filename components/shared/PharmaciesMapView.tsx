"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Pharmacy } from "@/lib/mock-data";
import { getAlgeriaCoordinates } from "@/lib/algeria-coordinates";

const createCustomIcon = (isOpen: boolean, isSelected: boolean) => {
  const color = isSelected ? "#1A6EBD" : isOpen ? "#0EA96E" : "#9CA3AF";
  const size = isSelected ? 44 : 36;
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 16px; font-weight: bold; line-height: 1;">+</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

interface PharmaciesMapViewProps {
  pharmacies: Pharmacy[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function PharmaciesMapView({
  pharmacies,
  selectedId,
  onSelect,
}: PharmaciesMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const firstPh = pharmacies[0];
    const initialCenter: [number, number] = firstPh
      ? (getAlgeriaCoordinates(firstPh.wilaya, firstPh.city, firstPh.lat, firstPh.lng) as [number, number])
      : [36.7538, 3.0588];

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 12,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync markers when pharmacies or selectedId change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const points: [number, number][] = [];

    pharmacies.forEach((ph) => {
      const [lat, lng] = getAlgeriaCoordinates(ph.wilaya, ph.city, ph.lat, ph.lng);
      points.push([lat, lng]);

      const isSelected = ph.id === selectedId;
      const icon = createCustomIcon(ph.isOpen, isSelected);

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      const popupHtml = `
        <div dir="rtl" style="text-align: right; padding: 2px; min-width: 140px; font-family: sans-serif;">
          <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${ph.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${ph.address}، ${ph.city}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
            <span style="font-weight: bold; color: ${ph.isOpen ? "#0EA96E" : "#94a3b8"};">
              ${ph.isOpen ? "مفتوح الآن" : "مغلق"}
            </span>
            ${ph.isOnDuty ? '<span style="color: #2563eb; font-weight: bold; font-size: 10px; background: #eff6ff; padding: 1px 6px; border-radius: 4px;">مناوبة</span>' : ''}
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onSelect(ph.id);
      });

      markersRef.current.set(ph.id, marker);

      if (isSelected) {
        marker.openPopup();
        map.flyTo([lat, lng], 15, { duration: 0.6 });
      }
    });

    if (!selectedId && points.length > 0) {
      if (points.length === 1) {
        map.setView(points[0], 14);
      } else {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [pharmacies, selectedId, onSelect]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={containerRef} className="w-full h-full z-0" />
    </div>
  );
}
