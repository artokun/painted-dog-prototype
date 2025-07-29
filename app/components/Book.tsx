import { useRef, useEffect, useState, useMemo } from "react";
import { Center, Text, Text3D } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  useSpring,
  animated,
  config,
  useChain,
  useSpringRef,
  to,
} from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";

interface BookProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  spawnDelay?: number;
  isFeatured?: boolean;
  onClick?: () => void;
  isTopBook?: boolean;
  onPositionUpdate?: (y: number) => void;
  index: number;
  cmsData?: {
    title: string;
    author: string;
    price: number;
    description: string;
  };
}

function Book({
  position,
  size,
  color,
  spawnDelay = 0,
  isFeatured = false,
  onClick,
  isTopBook = false,
  onPositionUpdate,
  index,
  cmsData,
}: BookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  const [width, , depth] = size;
  const snap = useSnapshot(bookStore);
  const { camera } = useThree();

  // Mouse position for featured book rotation
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const [mouseRotation, setMouseRotation] = useState({ x: 0, y: 0 });

  // Generate subtle rotation noise
  const rotationNoise = useMemo(() => {
    if (isFeatured) return { x: 0, y: 0, z: 0 }; // No noise when featured
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }, [isFeatured]);

  // Target Y position (for stacking and drop animations)
  const targetY = position[1];

  // Default book data for fallback
  const bookTitle = cmsData?.title || `Book ${index + 1}`;
  const bookAuthor = cmsData?.author || "Unknown Author";

  // Dynamic font sizing for spine based on title length
  const getSpineFontSize = (text: string) => {
    if (text.length > 20) return 0.005; // Very small for long titles
    if (text.length > 15) return 0.006; // Small for medium titles
    if (text.length > 10) return 0.007; // Normal-small for slightly long titles
    return 0.008; // Normal size for short titles
  };

  // Text wrapping function for face titles - returns array of lines
  const wrapText = (text: string, maxLength: number = 12): string[] => {
    if (text.length <= maxLength) return [text];

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length > maxLength) {
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          // Word is too long, just add it
          lines.push(word);
        }
      } else {
        currentLine += word + " ";
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  };

  // Calculate if this book should drop (is above the featured book)
  const shouldDrop =
    snap.featuredBookIndex !== null &&
    index > snap.featuredBookIndex &&
    !isFeatured;

  // Spring refs for chaining
  const slideRef = useSpringRef();
  const rotateRef = useSpringRef();
  const liftRef = useSpringRef();

  // Spring for initial spawn drop animation
  const [spawnSpring] = useSpring(
    () => ({
      from: { posY: 0.01 }, // Start 0.5 meters above
      to: { posY: 0 },
      delay: spawnDelay,
      config: config.stiff,
    }),
    [spawnDelay]
  );

  // Spring for vertical drop animation (books above featured)
  const [dropSpring] = useSpring(
    () => ({
      dropY: shouldDrop ? -snap.slidOutBookThickness : 0,
      config: config.gentle,
    }),
    [shouldDrop, snap.slidOutBookThickness]
  );

  // Calculate optimal Z distance for featured book to fill 75% of viewport height
  const calculateOptimalZDistance = () => {
    if (!isFeatured) return depth;

    // Use a fixed reference book height so all books appear the same size on screen
    // Using medium book width (0.185) as the reference since it's in the middle of the range
    const referenceBookHeight = 0.185;

    // VIEWPORT_PERCENTAGE: Adjust this value to change how much of the screen the featured book fills
    const targetScreenPercentage = 1.6;

    // Camera FOV (from page.tsx)
    const fov = 45;
    const fovRadians = (fov * Math.PI) / 180;

    // Calculate distance needed for book to fill target percentage of viewport
    // Using: tan(fov/2) = (height/2) / distance
    // Rearranged: distance = (height/2) / tan(fov/2)
    const halfFov = fovRadians / 2;
    const viewportHeightAtUnitDistance = 2 * Math.tan(halfFov);

    // Same distance for all books so they appear the same size on screen
    const distance =
      referenceBookHeight /
      (targetScreenPercentage * viewportHeightAtUnitDistance);

    return distance;
  };

  // Spring for slide animation
  const [slideSpring] = useSpring(() => {
    const optimalZ = calculateOptimalZDistance();
    return {
      ref: slideRef,
      from: { posY: 0, posZ: 0 },
      to: isFeatured
        ? {
            posY: 0,
            posZ: optimalZ, // Slide to optimal distance for viewport
          }
        : { posY: 0, posZ: 0 },
      config: config.gentle,
    };
  }, [isFeatured, width]);

  // Spring for rotation animation (without Y tracking)
  const [rotateSpring] = useSpring(
    () => ({
      ref: rotateRef,
      from: isTopBook
        ? { rotX: -Math.PI / 2, rotY: -Math.PI / 2 } // Top book starts standing
        : { rotX: 0, rotY: 0 },
      to: isFeatured
        ? { rotX: -Math.PI / 2, rotY: -Math.PI / 2 } // All featured books rotate the same
        : isTopBook
          ? { rotX: -Math.PI / 2, rotY: -Math.PI / 2 } // Top book stays standing when not featured
          : { rotX: 0, rotY: 0 }, // Other books lay flat when not featured
      config: config.gentle,
      immediate: isTopBook && !isFeatured, // Skip animation for initial state
    }),
    [isFeatured, isTopBook]
  );

  // Separate spring for Y position lifting
  const [liftSpring, liftApi] = useSpring(() => {
    const cameraOffset = isFeatured ? camera.position.y - targetY : 0;

    return {
      ref: liftRef,
      from: { posY: 0 },
      to: { posY: isFeatured ? cameraOffset : 0 },
      config: config.gentle,
    };
  }, [isFeatured, camera.position.y, targetY]);

  // Spring for mouse-based tilt when featured
  const [tiltSpring] = useSpring(
    () => ({
      tiltX: mouseRotation.x,
      tiltY: mouseRotation.y,
      config: { mass: 1, tension: 350, friction: 40 },
    }),
    [mouseRotation]
  );


  // Chain animations: slide, rotate, and lift happen together after slide
  useChain(
    isFeatured
      ? [slideRef, rotateRef, liftRef] // Slide first, then rotate and lift together
      : [liftRef, rotateRef, slideRef], // Reverse: lift down and rotate, then slide
    isFeatured
      ? [0, 0.5, 0.5] // Slide at 0, rotate and lift at 50%
      : [0, 0, 0.5] // Lift and rotate together at 0, slide at 50%
  );

  // No need for spawn state - handled by spring animation

  // Handle mouse movement for featured book
  useEffect(() => {
    if (!isFeatured) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      mouseX.current = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(e.clientY / window.innerHeight) * 2 + 1;

      // Set rotation based on mouse position (subtle effect)
      const maxTilt = 0.15; // Maximum tilt in radians (~8.5 degrees)
      setMouseRotation({
        x: mouseY.current * maxTilt, // Pitch
        y: mouseX.current * maxTilt, // Roll (reversed for natural feel)
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isFeatured]);

  // Update Y tracking position as camera moves
  useFrame(() => {
    if (isFeatured) {
      const targetOffset = camera.position.y - targetY;
      liftApi.start({ posY: targetOffset });
    }
  });

  return (
    <animated.group
      position-x={position[0]}
      position-y={spawnSpring.posY.to((py) => targetY + py)}
      position-z={position[2]}
      rotation={[rotationNoise.x, rotationNoise.y, rotationNoise.z]}
    >
      <animated.group position-y={dropSpring.dropY}>
        <animated.group
          ref={groupRef}
          position-y={to(
            [slideSpring.posY, liftSpring.posY],
            (slide, lift) => slide + lift
          )}
          position-z={slideSpring.posZ}
          rotation-x={rotateSpring.rotX}
          rotation-y={rotateSpring.rotY}
          onPointerEnter={(e) => {
            e.stopPropagation();
            // Hover disabled for debugging
            // if (!isFeatured) setIsHovered(true);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            // setIsHovered(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          {/* Additional rotation group for mouse-based tilt */}
          <animated.group
            rotation-x={isFeatured ? tiltSpring.tiltY : 0}
            rotation-z={isFeatured ? tiltSpring.tiltX : 0}
          >
            <animated.mesh ref={meshRef} castShadow receiveShadow>
              <boxGeometry args={size} />
              <meshStandardMaterial
                color={color}
                metalness={0.1}
                roughness={0.8}
              />
            </animated.mesh>

            {/* Text group - now inside tilt rotation */}
            <group ref={textGroupRef}>
              {/* Spine text - always visible */}
              {/* Title - On the spine facing forward, left aligned */}
              <Text
                position={[-width / 2 + 0.006, 0, depth / 2 + 0.0002]}
                rotation={[0, 0, 0]}
                fontSize={getSpineFontSize(bookTitle)}
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
                font="/fonts/fields-bold.otf"
                raycast={() => null}
              >
                {bookTitle}
              </Text>

              {/* Author - On the spine facing forward, right aligned */}
              <Text
                position={[width / 2 - 0.006, 0, depth / 2 + 0.0002]}
                rotation={[0, 0, 0]}
                fontSize={0.005}
                color="#cccccc"
                anchorX="right"
                anchorY="middle"
                fontWeight={300}
                raycast={() => null}
              >
                {bookAuthor}
              </Text>

              {/* Front cover text - Title centered in main area */}
              {(() => {
                const lines = wrapText(bookTitle);
                const lineHeight = 0.012; // Space between lines
                const totalHeight = (lines.length - 1) * lineHeight;
                const startY = totalHeight / 2;

                return lines.map((line, index) => (
                  <Center
                    key={index}
                    position={[
                      0.01 - (index * lineHeight - startY),
                      -size[1] / 2 - 0.0001,
                      0,
                    ]}
                  >
                    <Text3D
                      rotation={[Math.PI / 2, 0, -Math.PI / 2]}
                      font="/FSP DEMO - Fields Display_Bold.json"
                      size={0.009}
                      height={0.0005} // Extrusion depth
                      curveSegments={12}
                      bevelEnabled={true}
                      bevelThickness={0.00005}
                      bevelSize={0.00005}
                      bevelOffset={0}
                      bevelSegments={5}
                      letterSpacing={0}
                      raycast={() => null}
                    >
                      {line}
                      <meshStandardMaterial
                        color={new THREE.Color(0.5, 0.5, 0.3)}
                        metalness={0.9}
                        roughness={0.4}
                      />
                    </Text3D>
                  </Center>
                ));
              })()}

              {/* Front cover text - Author below title */}
              <Text
                position={[-0.02, -size[1] / 2 - 0.0002, 0]}
                rotation={[Math.PI / 2, 0, -Math.PI / 2]}
                fontSize={0.006}
                color="#cccccc"
                anchorX="center"
                anchorY="middle"
                fontWeight={300}
                raycast={() => null}
                maxWidth={width * 0.8}
                textAlign="center"
              >
                {bookAuthor}
              </Text>
            </group>
          </animated.group>
        </animated.group>
      </animated.group>
    </animated.group>
  );
}

export default Book;
