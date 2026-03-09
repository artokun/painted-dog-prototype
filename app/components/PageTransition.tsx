"use client";

import { type ReactNode } from "react";
import { animated, useSpring } from "@react-spring/web";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  id: string;
  className?: string;
  /** Slide direction on mount. Default: "right" */
  direction?: "left" | "right";
}

/**
 * Lightweight mount-animation wrapper for server-rendered pages.
 * Plays a slide + fade entrance on first render.
 * For client-side overlay pages that toggle visibility, use PageOverlay instead.
 */
export function PageTransition({
  children,
  id,
  className,
  direction = "right",
}: PageTransitionProps) {
  const xOffset = direction === "right" ? 100 : -100;

  const style = useSpring({
    from: { opacity: 0, x: xOffset },
    to: { opacity: 1, x: 0 },
    delay: 100,
    config: { tension: 200, friction: 26 },
  });

  return (
    <animated.div
      id={id}
      style={style}
      className={cn(
        "absolute inset-0 h-full w-full z-10 pointer-events-auto overflow-y-auto overflow-x-hidden",
        className,
      )}
    >
      {children}
    </animated.div>
  );
}
