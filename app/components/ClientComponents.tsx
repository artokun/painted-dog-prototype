"use client";

import dynamic from "next/dynamic";

export const Middle = dynamic(() => import("./Middle").then(mod => ({ default: mod.Middle })), {
  ssr: false,
});

export const Foreground = dynamic(() => import("./Foreground").then(mod => ({ default: mod.Foreground })), {
  ssr: false,
});