import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useSpring, animated } from "@react-spring/web";
import { useControls, folder } from "leva";

export type CursorSvgHandle = {
  blink: (blinkOnce?: boolean) => void;
};

type CursorSvgProps = {
  text: string;
  mousePosition: { x: number; y: number; nx: number; ny: number };
  scrollRef: React.RefObject<HTMLDivElement | null>;
  focusedBookId: string | null;
};

export const CursorSvg = forwardRef<CursorSvgHandle, CursorSvgProps>(
  ({ text, mousePosition, scrollRef, focusedBookId }, ref) => {
    const [isBlinking, setIsBlinking] = useState(false);

    const internalRef = useRef<SVGSVGElement>(null);

    const blink = useCallback((blinkOnce = false) => {
      const doubleBlinkChance = Math.random() > 0.7; // 30% chance for double blink

      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);

        if (doubleBlinkChance && !blinkOnce) {
          // Second blink after a short pause
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => {
              setIsBlinking(false);
            }, 120);
          }, 150);
        }
      }, 120);
    }, []);

    useImperativeHandle(ref, () => ({
      blink,
    }));

    // Periodic blinking
    useEffect(() => {
      // Start blinking after random initial delay
      const initialDelay = 2000 + Math.random() * 3000;
      const timeoutId = setTimeout(() => {
        blink();
        // Set up recurring blinks
        const intervalId = setInterval(
          () => {
            blink();
          },
          10000 + Math.random() * 10000
        ); // Blink every 10-17 seconds

        // Store interval ID for cleanup
        (window as any).blinkIntervalId = intervalId;
      }, initialDelay);

      return () => {
        clearTimeout(timeoutId);
        if ((window as any).blinkIntervalId) {
          clearInterval((window as any).blinkIntervalId);
        }
      };
    }, []);

    const eyeSpring = useSpring({
      // Invert X so eyes look back towards center horizontally
      x: Math.max(Math.min(1 - mousePosition.nx, 1), 0),
      // For Y, calculate the target position (center + scroll offset)
      y: (() => {
        const scrollTop = scrollRef.current?.scrollTop || 0;
        const viewportHeight = window.innerHeight;
        // Target is at center of viewport + scroll offset
        const targetY =
          (viewportHeight / 2 - scrollTop - (focusedBookId ? 0 : 100)) /
          viewportHeight;
        // Calculate where eyes should look relative to cursor position
        const eyeY = targetY - mousePosition.ny + 0.5;
        return Math.max(Math.min(eyeY, 1), 0);
      })(),
      rot: (() => {
        // Distance from center Y (0 at center, 1 at edges)
        const yFromCenter = Math.abs(mousePosition.ny - 0.5) * 2;

        // X position centered (-1 to 1)
        const xCentered = (mousePosition.nx - 0.5) * 2;

        // Base rotation: positive for BR and TL, negative for BL and TR
        // This creates the diagonal effect
        const baseRotation = xCentered * (mousePosition.ny - 0.5) * 4;

        // Apply Y distance scaling (full effect at edges, none at center)
        return (baseRotation * yFromCenter) / 2;
      })(),
      config: { tension: 400, friction: 25, mass: 1 },
    });

    const irisSpring = useSpring({
      scale: isBlinking ? 0.05 : 1,
      config: { tension: 400, friction: 25, mass: 1 },
    });

    const { enableBlinking, enableIris } = useControls("UI", {
      cursor: folder(
        {
          enableIris: {
            label: "Eyes",
            value: true,
          },
          enableBlinking: {
            label: "Blinking",
            value: true,
          },
        },
        { collapsed: true }
      ),
    });

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={internalRef}
      >
        <rect width="80" height="80" rx="40" fill="#1A1A1A" />
        <text
          x="50%"
          y="40.5%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="fields"
          fontWeight="500"
          fontSize="19"
          fill="#F2EFE9"
        >
          {text}
        </text>
        <text
          x="50%"
          y="61.5%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="fields"
          fontWeight="500"
          fontSize="19"
          fill="#F2EFE9"
        >
          Book
        </text>
        <animated.g
          style={{
            x: eyeSpring.x
              .to([0, 1], [-3, 3])
              .to((x) => 46.6 + Math.max(Math.min(x, 2), -2)),
            y: eyeSpring.y
              .to([0, 1], [-4, 4])
              .to((y) => 49 + Math.max(Math.min(y, 3), -3)),
          }}
          transform="translate(46.6 49)"
        >
          {enableIris && (
            <animated.ellipse
              cx="0"
              cy="0"
              rx="2"
              ry="2.5"
              fill="#F2EFE9"
              style={{
                rotateZ: eyeSpring.rot.to([-1, 1], [-45, 45]),
                scaleY: enableBlinking ? irisSpring.scale : 1,
              }}
            />
          )}
        </animated.g>
        <animated.g
          style={{
            x: eyeSpring.x
              .to([0, 1], [-3, 3])
              .to((x) => 35.6 + Math.max(Math.min(x, 2), -2)),
            y: eyeSpring.y
              .to([0, 1], [-4, 4])
              .to((y) => 49 + Math.max(Math.min(y, 3), -3)),
          }}
          transform="translate(35.6 49)"
        >
          {enableIris && (
            <animated.ellipse
              cx="0"
              cy="0"
              rx="2"
              ry="2.5"
              style={{
                rotateZ: eyeSpring.rot.to([-1, 1], [-45, 45]),
                scaleY: enableBlinking ? irisSpring.scale : 1,
              }}
              fill="#F2EFE9"
            />
          )}
        </animated.g>
      </svg>
    );
  }
);

CursorSvg.displayName = "CursorSvg";
