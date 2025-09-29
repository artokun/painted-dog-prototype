import { useRef, useEffect, memo, useMemo, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { useScroll } from "@react-three/drei";
import { useSpring } from "@react-spring/three";
import { getBookStackHeight, getGridHeight } from "../utils/book";
import { filterStore, FilterView } from "../store/filterStore";
import { lerp } from "three/src/math/MathUtils.js";
import { useGridOverrideControls } from "../hooks/useGridOverrideControls";
import { globalStore } from "@/app/store/globalStore";
import * as THREE from "three";

const CameraController = memo(function CameraController() {
  const { camera } = useThree();
  const mouseX = useRef(0);
  const { view, isChangingView } = useSnapshot(filterStore);
  const { currentRoute } = useSnapshot(globalStore);
  const isGridMode = view === FilterView.Grid;
  // Get book state

  const { focusedBookId, isRendered } = useSnapshot(bookStore);
  const hasFocusedBook = focusedBookId !== null;
  // Drei scroll hook
  const scroll = useScroll();
  const gridOverrideControls = useGridOverrideControls();

  // Create a ref for the lookAt target
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Track window height for responsive bottom limit
  const [windowHeight, setWindowHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    scroll.el.id = "scroll-el";
  }, []);

  // Calculate camera distance (fixed distance, no responsive behavior)
  const distance = useMemo(() => {
    const bookWidth = 0.28;
    const desiredScreenPercentage = 0.6;
    const fov = 45; // From page.tsx
    const calculatedDistance =
      bookWidth /
      desiredScreenPercentage /
      (2 * Math.tan((fov * Math.PI) / 360));

    return calculatedDistance;
  }, [isRendered]);

  // Get scroll pages from global store
  const { scrollPages } = useSnapshot(globalStore);

  // Calculate height limits based on view mode
  const { topLimit, bottomLimit } = useMemo(() => {
    const gridLimits = getGridHeight(gridOverrideControls);

    // FRESH APPROACH:
    // The HTML content moves exactly 1 viewport height per scroll page
    // We need the camera to move a consistent amount in world units per scroll page

    const topLimit = 0.1; // Starting position

    // Camera movement per scroll page (in world units)
    // This should be constant regardless of viewport size
    const cameraMovementPerPage = 0.51; // Tweak this value to match scroll speed

    // Total camera movement = movement per page * number of pages
    // But we subtract 1 because the first page is already in view
    const totalCameraMovement = cameraMovementPerPage * (scrollPages - 1);

    // Bottom limit is top minus total movement
    const bottomLimit = topLimit - totalCameraMovement;

    // restore this after accelerated launch
    return {
      gridLimits,
      topLimit,
      bottomLimit,
    };

    // Commented out for accelerated launch
    // return {
    //   gridLimits,
    //   topLimit: isGridMode ? gridLimits.topLimit : getBookStackHeight() + 0.12,
    //   bottomLimit: 0.03,
    // };
  }, [isGridMode, isRendered, gridOverrideControls, scrollPages, windowHeight]);

  // Spring for camera Y position - start at top
  const [{ cameraY }, api] = useSpring(() => ({
    cameraY: lerp(topLimit, bottomLimit, scroll.offset),
    config: { mass: 1, tension: 120, friction: 20 },
  }));

  // Spring for mouse rotation
  const [{ rotation }, rotationApi] = useSpring(() => ({
    rotation: 0,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  // TODO: Restore this after accelerated launch
  useEffect(() => {
    // if (focusedBookId !== null && scroll.offset > 0.7) {
    //   scroll.el.scrollTop = scroll.el.scrollTop * 0.7;
    // }
    // Accelerated launch ONLY
    if (focusedBookId !== null) {
      scroll.el.scrollTop = 0;
    }
  }, [focusedBookId, scroll.el, scroll.offset]);

  // Handle mouse movement for rotation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseX.current = normalizedX;

      if (hasFocusedBook || isGridMode) {
        // Disable rotation when book is focused
        rotationApi.start({ rotation: 0 });
      } else {
        // Resume following mouse only when no book is focused
        rotationApi.start({ rotation: -mouseX.current * 0.15 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasFocusedBook, rotationApi, isGridMode]);

  // Apply camera transformations in useFrame (required for camera updates)
  useFrame(() => {
    // Get scroll value from drei ScrollControls (0-1)
    const scrollValue = scroll.offset;
    const scrollBasedY = topLimit - (topLimit - bottomLimit) * scrollValue;

    // Update camera Y position from scroll
    if (isChangingView) {
      // Reset scroll position to top and animate camera
      scroll.el.scrollTop = 0;
      api.start({
        cameraY: topLimit,
      });
    } else {
      api.set({
        cameraY: scrollBasedY,
      });
    }

    // Get current spring values
    const currentY = cameraY.get();
    const currentRotation = rotation.get();

    const rotatedX = Math.sin(currentRotation) * distance;
    const rotatedZ = Math.cos(currentRotation) * distance;

    // Set camera position and lookAt target based on route
    switch (currentRoute) {
      case "/not-found":
      case "/contact": {
        // When on contact page, rotate camera 90 degrees to the right

        // Set camera position (fixed distance from origin)
        camera.position.x = lerp(camera.position.x, 0, 0.1);
        camera.position.y = currentY;
        camera.position.z = lerp(camera.position.z, distance, 0.1);

        // Update target to look to the right, maintaining same Z as camera
        lookAtTarget.current.set(distance, currentY, distance);
        break;
      }
      case "/legal": {
        // Rotate camera to the left for legal page

        camera.position.x = lerp(camera.position.x, 0, 0.1);
        camera.position.y = currentY;
        camera.position.z = lerp(camera.position.z, distance, 0.1);

        // Look towards the left side
        lookAtTarget.current.set(-distance, currentY, distance);
        break;
      }
      default: {
        // Calculate camera position with rotation

        // Set camera position
        camera.position.x = lerp(camera.position.x, rotatedX, 0.1);
        camera.position.y = currentY;
        camera.position.z = lerp(camera.position.z, rotatedZ, 0.1);

        // Update target to look at center
        lookAtTarget.current.set(0, currentY, 0);
        break;
      }
    }

    // Smoothly interpolate the horizontal rotation (X and Z for lookAt)
    // but instantly update the vertical position (Y)
    currentLookAt.current.x = lerp(
      currentLookAt.current.x,
      lookAtTarget.current.x,
      0.2
    );
    currentLookAt.current.y = lookAtTarget.current.y; // Instant vertical tracking
    currentLookAt.current.z = lerp(
      currentLookAt.current.z,
      lookAtTarget.current.z,
      0.2
    );

    // Apply the smoothed lookAt
    camera.lookAt(currentLookAt.current);
  });

  return null;
});

export default CameraController;
