import { useState, useRef, useEffect, memo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CameraControllerProps {
  stackTop: number;
  totalBooks: number;
  onCameraMove?: (scrollY: number) => void;
}

const CameraController = memo(function CameraController({
  stackTop,
  totalBooks,
  onCameraMove,
}: CameraControllerProps) {
  const { camera, size } = useThree();
  const [targetScrollY, setTargetScrollY] = useState(0.05); // Target position (adjusted for coffee table)
  const [currentScrollY, setCurrentScrollY] = useState(-1.1); // Actual position (adjusted for coffee table)
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [currentTilt, setCurrentTilt] = useState(0);
  const lastScrollTime = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStartTime, setAnimationStartTime] = useState<number | null>(
    null
  );
  const hasStartedAnimation = useRef(false);
  const mouseX = useRef(0);
  const currentRotation = useRef(0);

  // Calculate camera distance to make books fill appropriate screen percentage
  const bookWidth = 0.25; // Maximum book width (largest type)
  const aspectRatio = size.width / size.height;
  // Use more screen width on portrait orientation, less on landscape
  const desiredScreenPercentage = aspectRatio < 1 ? 0.7 : 0.5;
  const fov = 60;
  const distance =
    bookWidth / desiredScreenPercentage / (2 * Math.tan((fov * Math.PI) / 360));

  // Stack height calculations
  const bottomLimit = 0.05; // Start at coffee table level
  const topLimit = stackTop;
  const initialY = bottomLimit; // Start at coffee table level

  // Calculate total animation duration
  const bookDelay = 150; // 150ms between books (matching App.tsx)
  const cameraStartDelay = 2000; // Start camera after 1s
  const totalAnimationDuration = totalBooks * bookDelay + 1000; // Add extra time at the end

  // Start animation immediately
  useEffect(() => {
    if (!hasStartedAnimation.current) {
      hasStartedAnimation.current = true;

      // Wait for first book to land before starting camera movement
      setTimeout(() => {
        setIsAnimating(true);
        setAnimationStartTime(Date.now());

        // Stop animating after all books have spawned
        setTimeout(() => {
          setIsAnimating(false);
        }, totalAnimationDuration);
      }, cameraStartDelay);
    }
  }, [totalAnimationDuration, cameraStartDelay]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnimating) return; // Don't allow manual scroll during animation

      e.preventDefault();
      const now = Date.now();
      lastScrollTime.current = now;

      // Normalize scroll input (mouse wheels typically have larger deltas)
      const normalizedDelta =
        Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50);

      setTargetScrollY((prev) => {
        const scrollSpeed = 0.0005; // Reduced for smoother scrolling
        const newY = prev + normalizedDelta * scrollSpeed;
        return Math.max(bottomLimit, Math.min(topLimit, newY));
      });

      // Track scroll velocity for tilt
      setScrollVelocity(normalizedDelta);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [bottomLimit, topLimit, isAnimating]);

  // Handle mouse movement for horizontal camera rotation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseX.current = normalizedX;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    // Calculate target position based on animation progress
    if (isAnimating && animationStartTime) {
      const elapsed = Date.now() - animationStartTime;
      const progress = Math.min(elapsed / totalAnimationDuration, 1);

      // Ease-out cubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const animatedY = bottomLimit + (topLimit - bottomLimit) * easeOutCubic;
      setTargetScrollY(animatedY);
    }

    // Smoothly lerp current position to target position
    const lerpFactor = isAnimating ? 0.1 : 0.1; // Consistent smooth movement
    const newCurrentY = THREE.MathUtils.lerp(
      currentScrollY,
      targetScrollY,
      lerpFactor
    );
    setCurrentScrollY(newCurrentY);

    // Calculate tilt based on scroll velocity
    let targetTilt = 0;
    if (Math.abs(scrollVelocity) > 0.1) {
      // Tilt based on scroll direction and speed
      targetTilt =
        Math.sign(scrollVelocity) *
        Math.min(Math.abs(scrollVelocity) * 0.02, 15);
    }

    // Smoothly lerp current tilt
    setCurrentTilt((prev) => {
      const lerpSpeed = targetTilt === 0 ? 0.1 : 0.2; // Faster when tilting, slower when returning
      return prev + (targetTilt - prev) * lerpSpeed;
    });

    // Decay scroll velocity
    setScrollVelocity((prev) => prev * 0.9);

    // Smoothly lerp mouse rotation (flipped)
    const targetRotation = -mouseX.current * 0.15; // Max 0.15 radians rotation (about 8.5 degrees) - FLIPPED
    currentRotation.current = THREE.MathUtils.lerp(
      currentRotation.current,
      targetRotation,
      0.05 // Smooth lerping
    );

    // Calculate camera position with rotation around Y axis
    const rotatedX = Math.sin(currentRotation.current) * distance;
    const rotatedZ = Math.cos(currentRotation.current) * distance;

    // Set camera position
    camera.position.x = rotatedX;
    camera.position.y = newCurrentY;
    camera.position.z = rotatedZ;

    // Look at current Y position with tilt
    const lookAtY =
      newCurrentY + Math.sin((currentTilt * Math.PI) / 180) * distance;
    camera.lookAt(0, lookAtY, 0);

    // Notify parent of camera movement for parallax effect
    if (onCameraMove) {
      onCameraMove(newCurrentY);
    }
  });

  return null;
});

export default CameraController;
