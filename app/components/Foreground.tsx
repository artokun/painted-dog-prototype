"use client";

import { Header } from "./Header";
import { FloatingBar } from "./FloatingBar";
import { Loader } from "@react-three/drei";
import { usePathname, useRouter } from "next/navigation";
import { globalStore } from "../store/globalStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeKey } from "valtio/utils";
import { bookStore } from "../store/bookStore";
import { useSnapshot } from "valtio";
import BookPageContent from "./BookPageContent";
import { folder, useControls } from "leva";
import { useSpring, animated } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { ContactPageContent } from "./ContactPageContent";
import { LegalPageContent } from "./LegalPageContent";

export const Foreground = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isRendered } = useSnapshot(bookStore);
  const { currentRoute } = useSnapshot(globalStore);
  const isContactPage = currentRoute === "/contact";
  const isLegalPage = currentRoute === "/legal";

  const { showFloatingBar } = useControls(
    "UI",
    {
      showFloatingBar: {
        value: false,
        label: "Filters",
      },
    },
    { collapsed: true }
  );

  // This sets the current route to the pathname when the pathname changes
  useEffect(() => {
    if (!pathname.startsWith("/books/")) {
      bookStore.focusedBookId = null;
    }
    globalStore.currentRoute = pathname;
  }, [pathname]);

  // This removes the loading overlay when the scene is rendered
  useEffect(() => {
    if (isRendered) {
      setTimeout(() => {
        document
          .getElementById("loading-overlay")
          ?.classList.remove("opacity-100");
        document.getElementById("loading-overlay")?.classList.add("opacity-0");
        setTimeout(() => {
          document.getElementById("loading-overlay")?.remove();
        }, 300);
      }, 300);
    }
  }, [isRendered]);

  // This allows us to navigate to the current route when the url changes from
  // inside of the react three fiber app
  useEffect(() => {
    // This allows us to navigate to the current route when the current route changes
    const unsubscribeCurrentRoute = subscribeKey(
      globalStore,
      "currentRoute",
      (currentRoute) => {
        if (currentRoute !== pathname) {
          router.push(currentRoute);
        }
      }
    );

    // This allows us to navigate to the current route when the focused book id changes
    const unsubscribeFocusedBookId = subscribeKey(
      bookStore,
      "focusedBookId",
      (focusedBookId) => {
        const book = focusedBookId ? bookStore.books[focusedBookId] : null;
        if (focusedBookId && book?.slug) {
          router.push(`/books/${book.slug}`);
        } else {
          router.push("/");
        }
      }
    );

    return () => {
      unsubscribeCurrentRoute();
      unsubscribeFocusedBookId();
    };
  }, [pathname]);

  return (
    <div
      id="foreground"
      className="absolute top-0 left-0 h-full w-full flex items-center justify-center flex-col z-20 pointer-events-none"
    >
      <Header />
      {showFloatingBar && <FloatingBar />}
      <BookPageContent />
      <Cursor />
      <ContactPageContent visible={isContactPage} />
      <LegalPageContent visible={isLegalPage} />
      <Loader />
    </div>
  );
};

const Cursor = () => {
  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    nx: 0.5,
    ny: 0.5,
  });
  const { hoveredBookId, focusedBookId, isRendered } = useSnapshot(bookStore);
  const [pressed, setPressed] = useState(false);
  const [text, setText] = useState("Focus Book");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [flipPressed, setFlipPressed] = useState(false);

  const style = useSpring({
    x: mousePosition.x,
    y: mousePosition.y,
    immediate: true,
  });

  useEffect(() => {
    scrollRef.current = document.getElementById("scroll-el") as HTMLDivElement;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        nx: e.clientX / window.innerWidth,
        ny: e.clientY / window.innerHeight,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Only trigger flip animation if a book is focused and cursor is hovering
      if (focusedBookId && hoveredBookId === focusedBookId) {
        setFlipPressed(true);
        setTimeout(() => setFlipPressed(false), 200);
      }
      blink(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isRendered, focusedBookId, hoveredBookId]);

  useEffect(() => {
    const TIME = 200;
    setPressed(true);
    setTimeout(() => {
      setText(!focusedBookId ? "Flip" : "Focus");
    }, TIME / 2);
    setTimeout(() => {
      setText(focusedBookId ? "Flip" : "Focus");
      setPressed(false);
    }, TIME);
  }, [focusedBookId]);

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
    <animated.div
      style={style}
      className="absolute top-0 left-0 h-20 w-20 translate-x-[-50%] translate-y-[-50%]"
    >
      <div
        className={cn(
          "flex items-center justify-cente rounded-full text-white w-full h-full text-center leading-none transition-all duration-200",
          hoveredBookId ? "opacity-100" : "opacity-0",
          hoveredBookId
            ? pressed
              ? "scale-50"
              : flipPressed
                ? "scale-90"
                : "scale-100"
            : "scale-0"
        )}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
      </div>
    </animated.div>
  );
};
