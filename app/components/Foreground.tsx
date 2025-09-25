"use client";

import { Header } from "./Header";
import { FloatingBar } from "./FloatingBar";
import { Loader } from "@react-three/drei";
import { usePathname, useRouter } from "next/navigation";
import { globalStore } from "../store/globalStore";
import { useEffect, useRef, useState } from "react";
import { subscribeKey } from "valtio/utils";
import { bookStore } from "../store/bookStore";
import { useSnapshot } from "valtio";
import BookPageContent from "./BookPageContent";
import { useControls } from "leva";
import { useSpring, animated } from "@react-spring/web";
import { cn } from "@/lib/utils";

export const Foreground = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isRendered } = useSnapshot(bookStore);

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
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isRendered]);

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
    // Scale irises based on distance from center (0.3 at center, 1 at edges)
    scale: (() => {
      const xFromCenter = Math.abs(mousePosition.nx - 0.5) * 2;
      const yFromCenter = Math.abs(mousePosition.ny - 0.5) * 2;
      // Use the maximum distance from center (circular distance)
      const distanceFromCenter = Math.min(
        Math.sqrt(xFromCenter * xFromCenter + yFromCenter * yFromCenter) /
          Math.sqrt(2),
        1
      );
      // Scale from 0.3 at center to 1 at edges
      return distanceFromCenter;
    })(),
    config: { tension: 400, friction: 25, mass: 1 },
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
          pressed ? "scale-50" : hoveredBookId ? "scale-100" : "scale-0"
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
            <animated.ellipse
              cx="0"
              cy="0"
              rx="2"
              ry="2.5"
              fill="#F2EFE9"
              style={{
                rotateZ: eyeSpring.rot.to([-1, 1], [-45, 45]),
                scaleY: eyeSpring.scale
                  .to([0, 0.5], [0.7, 1])
                  .to((scale) => Math.min(scale, 1)),
              }}
            />
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
            <animated.ellipse
              cx="0"
              cy="0"
              rx="2"
              ry="2.5"
              style={{
                rotateZ: eyeSpring.rot.to([-1, 1], [-45, 45]),
                scaleY: eyeSpring.scale
                  .to([0, 0.5], [0.7, 1])
                  .to((scale) => Math.min(scale, 1)),
              }}
              fill="#F2EFE9"
            />
          </animated.g>
        </svg>
      </div>
    </animated.div>
  );
};
