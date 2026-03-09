"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { useSpring } from "@react-spring/three";
import { bookStore } from "../store/bookStore";
import { globalStore } from "../store/globalStore";
import * as THREE from "three";

/**
 * CameraRig: All movement via React Spring + direct lerp.
 * - X-axis: Spring pans between routes
 * - Y-axis: Smooth lerp follows scroll; Spring for focus/route transitions
 * - Rotation: Spring orbits based on mouse X
 */
export function CameraRig() {
  const { viewport } = useThree();
  const rigRef = useRef<THREE.Group>(null!);
  const mouseX = useRef(0);
  const scrollFrozen = useRef(false);
  // When true, Y is driven by the spring (transitions). When false, by scroll lerp.
  const springDriven = useRef(false);

  const { currentRoute, scrollPages } = useSnapshot(globalStore);
  const { focusedBookId } = useSnapshot(bookStore);

  // --- Camera distance (Z) ---
  const distance = useMemo(() => {
    const bookWidth = 0.28;
    const desiredScreenPercentage = 0.5;
    const fov = 45;
    return (
      bookWidth /
      desiredScreenPercentage /
      (2 * Math.tan((fov * Math.PI) / 360))
    );
  }, []);

  // --- Y limits ---
  const baseTopLimit = 0.1;
  const homeOffset = viewport.height * 0.08;
  const topLimit = baseTopLimit + homeOffset;
  const cameraMovementPerPage = 0.6;
  const bottomLimit = topLimit - cameraMovementPerPage * (scrollPages - 1);

  // Store limits in refs so useFrame always has current values
  const limitsRef = useRef({ topLimit, bottomLimit, baseTopLimit });
  limitsRef.current = { topLimit, bottomLimit, baseTopLimit };

  // --- 1. Route Panning (X-axis) ---
  const [{ rigX }, xApi] = useSpring(() => ({
    rigX: 0,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  useEffect(() => {
    const isBookRoute = currentRoute.startsWith("/books/");
    const shouldPanLeft = currentRoute !== "/" && !isBookRoute;
    const targetX = shouldPanLeft ? -viewport.width : 0;
    xApi.start({ rigX: targetX });
  }, [currentRoute, viewport.width, xApi]);

  // --- 2. Y-axis Spring (used only for discrete transitions) ---
  const [{ rigY }, yApi] = useSpring(() => ({
    rigY: topLimit,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  const getScrollProgress = useCallback(() => {
    const scrollEl = document.getElementById("scroll-container");
    if (!scrollEl) return 0;
    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
    return maxScroll > 0
      ? Math.min(Math.max(scrollEl.scrollTop / maxScroll, 0), 1)
      : 0;
  }, []);

  // --- 3. Focus / Route Override ---
  useEffect(() => {
    if (focusedBookId !== null) {
      // Freeze at current Y
      scrollFrozen.current = true;
      springDriven.current = false;
    } else if (currentRoute !== "/") {
      scrollFrozen.current = true;
      springDriven.current = true;
      yApi.start({ rigY: baseTopLimit });
    } else {
      // Returning to homepage — spring to scroll position, then hand off to lerp
      const progress = getScrollProgress();
      const targetY = topLimit + (bottomLimit - topLimit) * progress;
      springDriven.current = true;
      yApi.start({
        rigY: targetY,
        onRest: () => {
          springDriven.current = false;
          scrollFrozen.current = false;
        },
      });
    }
  }, [focusedBookId, currentRoute, topLimit, bottomLimit, baseTopLimit, yApi, getScrollProgress]);

  // --- 4. Mouse Parallax (Rotation) ---
  const [{ rotY }, rotApi] = useSpring(() => ({
    rotY: 0,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseX.current = normalizedX;

      if (focusedBookId === null && currentRoute === "/") {
        rotApi.start({ rotY: -mouseX.current * 0.15 });
      } else {
        rotApi.start({ rotY: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [focusedBookId, currentRoute, rotApi]);

  useEffect(() => {
    if (focusedBookId !== null || currentRoute !== "/") {
      rotApi.start({ rotY: 0 });
    }
  }, [focusedBookId, currentRoute, rotApi]);

  // --- 5. Frame Loop ---
  const SCROLL_LERP_SPEED = 0.25;

  useFrame(() => {
    if (!rigRef.current) return;

    rigRef.current.position.x = rigX.get();
    rigRef.current.rotation.y = rotY.get();

    if (springDriven.current) {
      // Discrete transition — let spring drive Y
      rigRef.current.position.y = rigY.get();
    } else if (!scrollFrozen.current) {
      // Scroll tracking — smooth lerp toward target
      const { topLimit: top, bottomLimit: bot } = limitsRef.current;
      const progress = getScrollProgress();
      const targetY = top + (bot - top) * progress;
      rigRef.current.position.y = THREE.MathUtils.lerp(
        rigRef.current.position.y,
        targetY,
        SCROLL_LERP_SPEED
      );
    }
    // When frozen (focused book), Y stays unchanged
  });

  return (
    <group ref={rigRef} position={[0, topLimit, 0]}>
      <PerspectiveCamera makeDefault position={[0, 0, distance]} fov={45} />
    </group>
  );
}
