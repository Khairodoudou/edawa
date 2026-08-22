"use client";

import dynamic from "next/dynamic";

const PharmacyDetailMap = dynamic(
  () => import("./PharmacyDetailMap"),
  {
    ssr: false,
    loading: () => <div className="w-full h-[290px] bg-muted rounded-b-2xl animate-pulse flex items-center justify-center text-xs text-muted-foreground">جارٍ تحميل الخريطة...</div>,
  }
);

interface PharmacyDetailMapWrapperProps {
  lat?: number;
  lng?: number;
  name: string;
  wilaya?: string;
  city?: string;
  address?: string;
}

export default function PharmacyDetailMapWrapper({
  lat,
  lng,
  name,
  wilaya,
  city,
  address,
}: PharmacyDetailMapWrapperProps) {
  return (
    <PharmacyDetailMap
      lat={lat}
      lng={lng}
      name={name}
      wilaya={wilaya}
      city={city}
      address={address}
    />
  );
}
