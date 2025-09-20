"use client";

import { ReactNode } from "react";
import { globalStore } from "../store/globalStore";
import { LinkProps } from "next/link";
import { cn } from "@/lib/utils";

export const ThreeLink = ({
  href,
  children,
  className,
}: LinkProps<"a"> & { children: ReactNode; className?: string }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (href && href !== "#") {
      if (typeof window !== "undefined") {
        globalStore.currentRoute = href.toString();
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn("appearance-none cursor-pointer", className)}
    >
      {children}
    </button>
  );
};
