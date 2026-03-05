"use client";

import type { ReactNode } from "react";

export function PageSlot({ children }: { children: ReactNode }) {
  return (
    <div
      id="page-slot"
      data-slot="abrams-pages"
      className="absolute inset-0 pointer-events-none"
    >
      {/* Dedicated DOM layer for page content/animations that should sit above 3D */}
      <div id="page-slot-content" className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
}
