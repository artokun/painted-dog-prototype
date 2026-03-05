"use client";

import { useRef, useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { useSpring } from "@react-spring/three";
import { bookStore } from "../store/bookStore";
import { globalStore } from "../store/globalStore";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * CameraRig: A group-based camera system that separates concerns:
 * - X-axis: React Spring pans between routes (viewport-relative)
 * - Y-axis: GSAP ScrollTrigger scrubs based on native scroll
 * - Rotation: React Spring orbits based on mouse X position
 * - Focus: Pauses scroll scrubbing when a book is focused
 *
 * The scene (books) stays at the origin. The rig moves around it.
 */
export function CameraRig() {
  const { viewport } = useThree();
  const rigRef = useRef<THREE.Group>(null!);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const mouseX = useRef(0);

  const { currentRoute, scrollPages } = useSnapshot(globalStore);
  const { focusedBookId } = useSnapshot(bookStore);

  // --- Camera distance (Z) ---
  // Fixed distance so books occupy ~50% of screen width
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

  // --- 1. Route Panning (X-axis) via React Spring ---
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

  // --- 2. Scroll-Driven Y (GSAP ScrollTrigger) ---
  const topLimit = 0.1;
  const cameraMovementPerPage = 0.6;
  const bottomLimit = topLimit - cameraMovementPerPage * (scrollPages - 1);

  useEffect(() => {
    const scrollEl = document.getElementById("scroll-container");
    if (!scrollEl || !rigRef.current) return;

    // Kill previous trigger if it exists
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }

    // Set initial Y position
    rigRef.current.position.y = topLimit;

    const tween = gsap.fromTo(
      rigRef.current.position,
      { y: topLimit },
      { y: bottomLimit, ease: "none" }
    );

    const st = ScrollTrigger.create({
      id: "camera-scroll",
      scroller: scrollEl,
      trigger: scrollEl.firstElementChild || scrollEl,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      animation: tween,
    });

    scrollTriggerRef.current = st;

    // Refresh after layout settles (content may not be fully sized yet)
    const rafId = requestAnimationFrame(() => st.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      tween.kill();
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [topLimit, bottomLimit]);

  // --- 3. Focus Override ---
  useEffect(() => {
    const st = scrollTriggerRef.current;
    if (!st || !rigRef.current) return;

    if (focusedBookId !== null) {
      st.disable(false); // Pause without resetting ScrollTrigger state
      gsap.to(rigRef.current.position, {
        y: topLimit,
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      st.enable(false); // Resume without resetting position
      // Smoothly snap to current scroll position
      const progress = st.progress;
      const targetY = topLimit + (bottomLimit - topLimit) * progress;
      gsap.to(rigRef.current.position, {
        y: targetY,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => st.refresh(),
      });
    }
  }, [focusedBookId, topLimit, bottomLimit]);

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

      // Only orbit on home page when no book is focused
      if (focusedBookId === null && currentRoute === "/") {
        rotApi.start({ rotY: -mouseX.current * 0.15 });
      } else {
        rotApi.start({ rotY: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [focusedBookId, currentRoute, rotApi]);

  // Ensure camera yaw is reset immediately when focusing a book or leaving home,
  // even if no mousemove event fires after the state change.
  useEffect(() => {
    if (focusedBookId !== null || currentRoute !== "/") {
      rotApi.start({ rotY: 0 });
    }
  }, [focusedBookId, currentRoute, rotApi]);

  // --- 5. Frame Loop ---
  // Apply Spring-driven values (X pan, rotation). Y is handled by GSAP directly.
  useFrame(() => {
    if (!rigRef.current) return;
    rigRef.current.position.x = rigX.get();
    rigRef.current.rotation.y = rotY.get();
  });

  return (
    <group ref={rigRef} position={[0, topLimit, 0]}>
      <PerspectiveCamera makeDefault position={[0, 0, distance]} fov={45} />
    </group>
  );
}
