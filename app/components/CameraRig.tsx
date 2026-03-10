"use client";

import { useRef, useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { useSpring } from "@react-spring/three";
import { bookStore } from "../store/bookStore";
import { globalStore } from "../store/globalStore";
import * as THREE from "three";

/**
 * CameraRig: Simple state-driven camera.
 * - X-axis: Spring pans between routes
 * - Y-axis: Single lerp in useFrame — no springs, no flags, no race conditions
 * - Rotation: Spring orbits based on mouse X
 */
export function CameraRig() {
  const { viewport } = useThree();
  const rigRef = useRef<THREE.Group>(null!);
  const mouseX = useRef(0);
  const frozenY = useRef<number | null>(null);

  const { currentRoute, scrollPages } = useSnapshot(globalStore);
  const { focusedBookId } = useSnapshot(bookStore);

  // --- Camera distance (Z) and stable viewport height ---
  const fov = 45;
  const distance = useMemo(() => {
    const bookWidth = 0.28;
    const desiredScreenPercentage = 0.5;
    return (
      bookWidth /
      desiredScreenPercentage /
      (2 * Math.tan((fov * Math.PI) / 360))
    );
  }, []);

  // Stable viewport height from Z distance only — NOT camera.distanceTo(origin)
  // which includes X/Y pan offsets and gives wrong topLimit after route transitions.
  const stableViewportHeight = useMemo(() => {
    return 2 * Math.tan((fov * Math.PI) / 360) * distance;
  }, [distance]);

  // --- Y limits (use stable height to avoid pan-dependent drift) ---
  const baseTopLimit = 0.1;
  const homeOffset = stableViewportHeight * 0.08;
  const topLimit = baseTopLimit + homeOffset;
  const cameraMovementPerPage = 0.6;
  const bottomLimit = topLimit - cameraMovementPerPage * (scrollPages - 1);

  // Store in ref so useFrame always has latest values
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

  // --- 2. Focus freeze ---
  useEffect(() => {
    if (focusedBookId !== null) {
      // Capture current Y so the lerp holds this value
      if (rigRef.current) {
        frozenY.current = rigRef.current.position.y;
      }
    } else {
      frozenY.current = null;
    }
  }, [focusedBookId]);

  // --- 3. Mouse Parallax (Rotation) ---
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

  // --- 4. Frame Loop ---
  const LERP_SPEED = 0.08;
  const SCROLL_LERP_SPEED = 0.25;

  useFrame(() => {
    if (!rigRef.current) return;

    rigRef.current.position.x = rigX.get();
    rigRef.current.rotation.y = rotY.get();

    const { topLimit: top, bottomLimit: bot, baseTopLimit: base } =
      limitsRef.current;

    // Determine target Y purely from current state — no flags or refs
    let targetY: number;
    let speed: number;

    if (frozenY.current !== null) {
      // Book focused — hold position
      targetY = frozenY.current;
      speed = 1; // instant
    } else if (currentRoute !== "/") {
      // Non-home route
      targetY = base;
      speed = LERP_SPEED;
    } else {
      // Homepage — follow scroll
      const scrollEl = document.getElementById("scroll-container");
      let progress = 0;
      if (scrollEl) {
        const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
        progress =
          maxScroll > 0
            ? Math.min(Math.max(scrollEl.scrollTop / maxScroll, 0), 1)
            : 0;
      }
      targetY = top + (bot - top) * progress;
      speed = SCROLL_LERP_SPEED;
    }

    rigRef.current.position.y = THREE.MathUtils.lerp(
      rigRef.current.position.y,
      targetY,
      speed
    );

  });

  return (
    <group ref={rigRef}>
      <PerspectiveCamera makeDefault position={[0, 0, distance]} fov={45} />
    </group>
  );
}
