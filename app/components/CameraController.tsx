import { useRef, useEffect, memo, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { useScroll } from "@react-three/drei";
import { useSpring } from "@react-spring/three";

const CameraController = memo(function CameraController() {
  const { camera } = useThree();
  const mouseX = useRef(0);

  // Get book state

  const snap = useSnapshot(bookStore);
  const hasFocusedBook = snap.focusedBookId !== null;

  // Drei scroll hook
  const scroll = useScroll();

  // Calculate camera distance (fixed distance, no responsive behavior)
  const distance = useMemo(() => {
    const bookWidth = 0.25;
    const desiredScreenPercentage = 0.7;
    const fov = 45; // From page.tsx
    const calculatedDistance =
      bookWidth /
      desiredScreenPercentage /
      (2 * Math.tan((fov * Math.PI) / 360));

    return calculatedDistance;
  }, []); // No dependencies - fixed distance

  // Stack height calculations
  // Use actual book positions if available
  // Add offset to prevent featured books from clipping through table
  // const bottomLimit = bookPositions.length > 0 ? bookPositions[0] + 0.1 : 0.2;
  // const topLimit =
  //   bookPositions.length > 0
  //     ? bookPositions[bookPositions.length - 1] + 0.0
  //     : stackTop;

  const topLimit = 1;
  const bottomLimit = 0;

  // Spring for camera Y position - start at top
  const [{ cameraY }, api] = useSpring(() => ({
    cameraY: topLimit,
    config: { mass: 1, tension: 120, friction: 20 },
  }));

  // Spring for mouse rotation
  const [{ rotation }, rotationApi] = useSpring(() => ({
    rotation: 0,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  // Handle mouse movement for rotation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseX.current = normalizedX;

      if (hasFocusedBook) {
        // Disable rotation when book is focused
        rotationApi.start({ rotation: 0 });
      } else {
        // Resume following mouse only when no book is focused
        rotationApi.start({ rotation: -mouseX.current * 0.15 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasFocusedBook, rotationApi]);

  // Apply camera transformations in useFrame (required for camera updates)
  useFrame(() => {
    // Get scroll value from drei ScrollControls (0-1)
    const scrollValue = scroll.offset;
    const scrollBasedY = topLimit - (topLimit - bottomLimit) * scrollValue;

    // Update camera Y position from scroll
    api.set({ cameraY: scrollBasedY });

    // Get current spring values
    const currentY = cameraY.get();
    const currentRotation = rotation.get();

    // Calculate camera position with rotation
    const rotatedX = Math.sin(currentRotation) * distance;
    const rotatedZ = Math.cos(currentRotation) * distance;

    // Set camera position
    camera.position.x = rotatedX;
    camera.position.y = currentY;
    camera.position.z = rotatedZ;

    // Look at the same Y position as camera (straight ahead)
    camera.lookAt(0, currentY, 0);
  });

  return null;
});

export default CameraController;
