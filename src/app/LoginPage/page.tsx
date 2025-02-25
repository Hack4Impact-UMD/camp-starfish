"use client";

import React from "react";

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="w-full h-32 bg-[#0c2844] fixed top-0 z-50" />

      <div className="pt-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/CampStarfishLoginBackground.png')" }}
        />
      </div>
    </div>
  );
}
