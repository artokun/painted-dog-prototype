"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animated, useSpring } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { globalStore } from "../store/globalStore";

interface PageOverlayProps {
  visible: boolean;
  id: string;
  children: ReactNode | ((showContent: boolean) => ReactNode);
  /** Slide direction when entering/exiting. Default: "right" */
  direction?: "left" | "right";
  className?: string;
  /** Called when visibility changes — useful for resetting page state */
  onVisibilityChange?: (visible: boolean, wasVisible: boolean) => void;
  /** Called once the enter animation finishes (good for anchor scroll, etc.) */
  onEnterComplete?: () => void;
}

export function PageOverlay({
  visible,
  id,
  children,
  direction = "right",
  className,
  onVisibilityChange,
  onEnterComplete,
}: PageOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent of visibility transitions
  useEffect(() => {
    if (visible !== wasVisible) {
      onVisibilityChange?.(visible, wasVisible);
      setWasVisible(visible);
    }
  }, [visible, wasVisible, onVisibilityChange]);

  // Track scroll position and smooth scroll to top on navigation away
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (visible) {
        globalStore.overlayScrollPosition = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll);

    if (!visible && container.scrollTop > 0) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      globalStore.overlayScrollPosition = 0;
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [visible]);

  const xOffset = direction === "right" ? 100 : -100;

  const style = useSpring({
    opacity: visible ? 1 : 0,
    x: visible ? 0 : xOffset,
    delay: visible ? 300 : 50,
    onStart: () => {
      setShowContent(true);
    },
    onRest: () => {
      setShowContent(visible);
      if (visible) {
        onEnterComplete?.();
      }
    },
  });

  return (
    <animated.div
      ref={containerRef}
      id={id}
      style={style}
      className={cn(
        "absolute inset-0 h-dvh w-dvw text-black z-10 overflow-y-auto overflow-x-hidden",
        !visible && "pointer-events-none",
        visible && "pointer-events-auto",
        className,
      )}
    >
      {typeof children === "function" ? children(showContent) : showContent ? children : null}
    </animated.div>
  );
}
