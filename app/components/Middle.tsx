"use client";

import { AdaptiveDpr, Scroll, ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import App from "./App";
import * as THREE from "three";
import {
  forwardRef,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
import { bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";
import { AddToCalendarButton } from "./ui/AddToCalendarButton";
import { NewsletterForm } from "./ui/NewsletterForm";
import { animated, useSpring } from "@react-spring/web";
import { globalStore } from "@/app/store/globalStore";
import debounce from "lodash.debounce";
import { useMediaQuery } from "usehooks-ts";
import { PurchaseButtons } from "./PurchaseButtons";

export const Middle = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);
  const [contentHeight, setContentHeight] = useState(0);
  const { isRendered } = useSnapshot(bookStore);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Update window height on resize with debouncing
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;
    
    const updateHeights = () => {
      setWindowHeight(window.innerHeight);
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    // Create debounced version with 150ms delay
    const debouncedUpdateHeights = debounce(updateHeights, 150);

    // Calculate heights when isRendered changes or on mount
    if (isRendered) {
      updateHeights();
    }

    // Window resize with debounce
    window.addEventListener("resize", debouncedUpdateHeights);

    // Also observe content changes with debounce
    const observer = new ResizeObserver(debouncedUpdateHeights);
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      debouncedUpdateHeights.cancel(); // Cancel any pending debounced calls
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", debouncedUpdateHeights);
      }
      observer.disconnect();
    };
  }, [isRendered]);

  // Calculate pages based on actual content height and viewport
  const pages = useMemo(() => {
    if (!windowHeight || !contentHeight) return 1.75;

    // Account for the 75vh offset (content starts at 75vh)
    // Total scrollable distance = 75vh (to reach content) + content height
    const totalScrollDistance = windowHeight * 0.75 + contentHeight;
    const calculatedPages = totalScrollDistance / windowHeight;

    return Math.max(calculatedPages, 1.5); // Minimum 1.5 pages
  }, [windowHeight, contentHeight]);

  // Update global store with pages value
  useEffect(() => {
    globalStore.scrollPages = pages;
  }, [pages]);

  return (
    <div id="middle" className="absolute inset-0 top-0 left-0 z-10">
      <Canvas
        camera={{ position: [0, 0.01, 0.3], fov: 45 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.LinearToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMappingExposure: 1.0,
          powerPreference: isMobile ? "low-power" : "high-performance",
          // depth: false,
          alpha: isMobile,
        }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={pages} damping={0.1}>
            <App />
            <Scroll html pixelPerfect>
              <TempAcceleratedContent ref={contentRef} />
            </Scroll>
          </ScrollControls>
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
};

const TempAcceleratedContent = forwardRef<HTMLDivElement, {}>((_, ref) => {
  const { currentRoute } = useSnapshot(globalStore);
  const { focusedBookId } = useSnapshot(bookStore);
  const isHomePage = currentRoute === "/";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Track if this is the first render
  useEffect(() => {
    setHasInitialized(true);
  }, []);

  const styles = useSpring({
    opacity: isHomePage && !focusedBookId ? 1 : 0,
    config: { tension: 400, friction: 35 }, // Even faster spring config
    immediate: !hasInitialized, // Skip animation on initial load if not home
  });

  return (
    <animated.section
      ref={ref}
      style={styles}
      className={cn(
        "relative w-dvw top-[75dvh] text-black flex flex-col gap-10",
        !isHomePage && "pointer-events-none"
      )}
    >
      <div className="flex flex-col md:flex-row gap-12 justify-around mx-auto max-w-3xl px-8 md:px-0">
        <div className="flex-1 flex flex-col gap-4">
          <h3 className="text-xl font-medium">
            An expansive publication in full colour showcasing decades&apos;
            worth of illustration done in hundreds of sketchbooks and journals
            by the creators of the biting satirical comic <i>Bitterkomix</i>.
          </h3>
          <PurchaseButtons layout="horizontal" isMobile={isMobile} />
        </div>
        <div className="flex-1 gap-4 flex flex-col">
          <h3 className="text-xl font-medium">Upcoming Events</h3>
          <p className="text-md">
            <i>Bitterkomix: Sketchbooks and Journals</i> will be launched at the
            Book Lounge, Cape Town, on 5 December 2025. Please arrive 17:30 for
            18:00.
          </p>
          <div className="mt-1">
            <AddToCalendarButton
              tall={isMobile}
              className="w-full"
              event={{
                title: "Bitterkomix Launch - Book Lounge",
                start: "20251205T153000Z",
                end: "20251205T170000Z",
                description:
                  "The artists will be in conversation with Sean O'Toole about this collection featuring more than a thousand images from their sketchbooks and journals of the past 30+ years.",
                location:
                  "The Book Lounge, Cnr Buitenkant &, 71 Roeland St, Cape Town City Centre, Cape Town, 8001, South Africa",
              }}
            />
          </div>
        </div>
      </div>
      <div className="border-b border-black w-[calc(100dvw-64px)] max-w-[400px] mx-auto h-[1px] pt-10 md:pt-3 mb-10 md:mb-0" />
      <div className="flex flex-col md:flex-row gap-20 md:gap-10 max-w-3xl mx-auto px-8 md:px-0">
        <article className="flex-1 flex flex-col gap-4">
          <h3 className="text-xl font-medium">New Publisher, New Tricks</h3>
          <p>
            Painted Dog Press is a new independent book publisher of fiction and
            non-fiction. Spearheaded by Fourie Botha (previously from Penguin
            Random House SA) and John Hunt (TBWA/Hunt/Lascaris), the press will
            develop and nurture quality literature and provide writers with a
            publishing house that continually fosters and markets their work.
            Painted Dog&apos;s efforts will be strengthened by tech innovation
            and human-first technology.
          </p>
        </article>
        <article className="flex-1 flex flex-col gap-4">
          <NewsletterForm />
        </article>
      </div>
      <Footer />
    </animated.section>
  );
});

TempAcceleratedContent.displayName = "TempAcceleratedContent";
