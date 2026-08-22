"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAlgeriaCoordinates } from "@/lib/algeria-coordinates";

interface PharmacyDetailMapProps {
  lat?: number;
  lng?: number;
  name: string;
  wilaya?: string;
  city?: string;
  address?: string;
}

export default function PharmacyDetailMap({
  lat,
  lng,
  name,
  wilaya,
  city,
  address,
}: PharmacyDetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [accurateLat, accurateLng] = getAlgeriaCoordinates(
    wilaya,
    city,
    lat,
    lng
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Fix default icon if needed
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(containerRef.current, {
        center: [accurateLat, accurateLng],
        zoom: 15,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: "custom-pharmacy-pin",
        html: `
          <div style="
            position: relative;
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, #0EA96E 0%, #0A7A50 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #ffffff;
            box-shadow: 0 6px 16px rgba(14, 169, 110, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 20px;
              font-weight: 900;
              line-height: 1;
            ">+</div>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([accurateLat, accurateLng], { icon: customIcon }).addTo(map);

      const locDetail = [address, city, wilaya ? `(${wilaya})` : ""].filter(Boolean).join(" • ");
      const popupHtml = `
        <div style="text-align: right; padding: 4px; font-family: sans-serif;" dir="rtl">
          <div style="font-weight: bold; font-size: 14px; color: #0EA96E; margin-bottom: 3px;">${name}</div>
          ${locDetail ? `<div style="font-size: 11px; color: #4b5563;">${locDetail}</div>` : ""}
        </div>
      `;
      marker.bindPopup(popupHtml).openPopup();

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
    } catch (err) {
      console.error("Leaflet map initialization error:", err);
    }
  }, [accurateLat, accurateLng, name, wilaya, city, address]);

  return (
    <div className="relative w-full h-[290px] rounded-b-2xl overflow-hidden bg-[#e5e7eb]">
      <div ref={containerRef} className="w-full h-full z-0" />
    </div>
  );
}
