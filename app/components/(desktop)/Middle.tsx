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
import { Footer } from "../Footer";
import { cn } from "@/lib/utils";
import { bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";
import { AddToCalendarButton } from "../ui/AddToCalendarButton";
import { NewsletterForm } from "../ui/NewsletterForm";
import { PDButton } from "../ui/PDButton";
import { ShoppingCartIcon } from "../icons/ShoppingCart";
import { animated, config, useSpring } from "@react-spring/web";
import { globalStore } from "@/app/store/globalStore";
import debounce from "lodash.debounce";

export const Middle = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const { isRendered } = useSnapshot(bookStore);

  // Update window height on resize with debouncing
  useEffect(() => {
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
      window.removeEventListener("resize", debouncedUpdateHeights);
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
          powerPreference: "high-performance",
          // depth: false,
          alpha: false,
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
  const isHomePage = currentRoute === "/";

  const styles = useSpring({
    opacity: isHomePage ? 1 : 0,
  });

  return (
    <animated.section
      ref={ref}
      style={styles}
      className={cn(
        "relative w-dvw top-[75vh] text-black flex flex-col gap-10",
        !isHomePage && "pointer-events-none"
      )}
    >
      <div className="flex gap-12 justify-around mx-auto max-w-3xl">
        <div className="flex-1 flex flex-col gap-3">
          <p className="text-lg font-medium">
            An expansive publication in full colour showcasing decades&apos;
            worth of illustration done in hundreds of sketchbooks and journals
            by the creators of the biting satirical comic <i>Bitterkomix</i>.
          </p>
          <div className="flex flex-wrap gap-2">
            <PDButton href="/contact" className="w-full" primary>
              <ShoppingCartIcon className="w-5 h-5 -mt-0.5" /> Buy for R760
            </PDButton>
            <PDButton href="/contact" className="flex-1">
              Takealot
            </PDButton>
            <PDButton className="flex-1" href="/contact">
              Exclusive Books
            </PDButton>
          </div>
        </div>
        <div className="flex-1 gap-3 flex flex-col">
          <h3 className="text-xl font-medium">Stellenbosch Woordfees</h3>
          <p className="text-md">
            The collection will be launching on September 18th at the
            Stellenbosch Woordfees.
          </p>
          <div className="mt-1">
            <AddToCalendarButton
              className="w-full"
              event={{
                title: "Bitterkomix Launch - Stellenbosch Woordfees",
                start: "20250918T100000Z",
                end: "20250918T120000Z",
                description:
                  "Launch of Bitterkomix Sketchbooks and Journals at Stellenbosch Woordfees",
                location: "Stellenbosch, South Africa",
              }}
            />
          </div>
        </div>
      </div>
      <div className="border-b border-black w-full max-w-[400px] mx-auto h-[1px] pb-3" />
      <div className="flex gap-10 max-w-3xl mx-auto">
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
        {/* <article className="flex-1 flex flex-col gap-4">
          <h3 className="text-xl font-medium">&nbsp;</h3>
          <p>
            The launch of <i>Bitterkomix</i>. at Stellenbosch Woordfees, simultaneously
            launches Painted Dog Press.
          </p>
          <p>
            Come and enjoy what Anton and Conrad have planned{" "}
            <strong>and</strong> meet the team that has brought Painted Dog to
            life.
          </p>
        </article> */}
        <article className="flex-1 flex flex-col gap-4">
          <h3 className="text-xl font-medium">Win a copy, be in the know</h3>
          <p className="text-md">
            Receive updates on page-turning developments and future publications
            in our newsletter and stand a chance to win a copy of{" "}
            <i>Bitterkomix</i> Sketchbooks and Journals.
          </p>
          <NewsletterForm />
        </article>
      </div>
      <Footer />
    </animated.section>
  );
});

TempAcceleratedContent.displayName = "TempAcceleratedContent";
