"use client";

import { ReactNode } from "react";
import { globalStore } from "../store/globalStore";
import { LinkProps } from "next/link";
import { cn } from "@/lib/utils";

/*
This is a wrapper around the next/link component that allows us to navigate to the current route when the url changes from
inside of the react three fiber app. See Foreground.tsx for more details.
*/
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
