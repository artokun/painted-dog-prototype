"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { animated, useSpring } from "@react-spring/web";
import { ThreeLink } from "./ThreeLink";
import { cn } from "@/lib/utils";
import { useSnapshot } from "valtio";
import { globalStore } from "../store/globalStore";
import { CloseIcon } from "./icons/Close";
import { useMediaQuery } from "usehooks-ts";
import { gsap } from 'gsap';
import { SplitText } from 'gsap/dist/SplitText';

// Register the plugin
gsap.registerPlugin(SplitText);


export const MenuOverlay = ({ visible }: { visible: boolean }) => {
  const [showContent, setShowContent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const { currentRoute } = useSnapshot(globalStore);
  const prevRouteRef = useRef(currentRoute);

  // Track scroll position and smooth scroll to top on navigation away
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (visible) {
        globalStore.overlayScrollPosition = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll);

    // Smooth scroll to top when navigating away
    if (!visible && container.scrollTop > 0) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      globalStore.overlayScrollPosition = 0;
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [visible]);

  useEffect(() => {
    if (!textRef.current || !visible) return;
  
    // Split the text into characters
    const split = new SplitText(textRef.current, {
      type: 'chars',
      charsClass: 'char',
    });
  
    // Set initial state
    gsap.set(split.chars, {
      opacity: 0,
      y: 20,
      rotationX: -90,
    });
  
    // Animate each character with a delay to sync with overlay appearance
    gsap.to(split.chars, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.8,
      stagger: 0.03,
      ease: 'back.out(1.7)',
      delay: 0.3, // Match the spring animation delay
    });
  
    // Cleanup: revert the split when component unmounts or becomes invisible
    return () => {
      split.revert();
    };
  }, [visible]); // Add visible as dependency


  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible) {
        globalStore.isMenuOpen = false;
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [visible]);

  // Close menu when route changes
  useEffect(() => {
    if (prevRouteRef.current !== currentRoute && visible) {
      globalStore.isMenuOpen = false;
    }
    prevRouteRef.current = currentRoute;
  }, [currentRoute, visible]);

  const style = useSpring({
    opacity: visible ? 1 : 0,
    x: visible ? 0 : 100,
    delay: visible ? 300 : 50,
    onStart: () => {
      setShowContent(true);
    },
    onRest: () => {
      setShowContent(visible);
    },
  });

  const handleClose = () => {
    globalStore.isMenuOpen = false;
  };

  return (
    <animated.div
      ref={containerRef}
      id="menu-overlay-scroll-container"
      style={style}
      className={cn(
        "absolute inset-0 h-dvh w-dvw text-black z-30 overflow-y-auto overflow-x-hidden bg-[#f6e5cc]",
        visible && "pointer-events-auto"
      )}
    >
      {showContent && (
        <div className="flex flex-col min-h-full pt-[104px]">
          {/* Close Button */}
          <div className="hidden justify-end p-4 md:p-8">
            <button
              onClick={handleClose}
              className="p-2 hover:opacity-70 transition-opacity pointer-events-auto"
              aria-label="Close menu"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col items-center justify-center p-[16px] max-w-[829px] bg-white self-center w-full -rotate-1">
            <div className="flex flex-col w-full outline-[#575757] outline-[1.74px] outline-offset-2 border-[4.36px] border-[#575757]">

            {/* main navigation */}
            <div className="flex  flex-row justify-between w-full px-[41px] py-[32px]">
              
              <ThreeLink href="/">
                <Image
                  src="/logo-dog-footer.png"
                  alt="Logo"
                  width={180}
                  height={74}
                  className="w-full h-full"
                />
              </ThreeLink>

              <ThreeLink
                href="/login"
                className="text-[32px] font-medium hover:opacity-70 transition-opacity"
                noUnderline
              >
                Login | SignUp
              </ThreeLink>
              <ThreeLink
                href="/cart"
                className="text-[32px] font-medium hover:opacity-70 transition-opacity"
                noUnderline
              >
                Cart
              </ThreeLink>

              <button
            onClick={handleClose}
            className="p-2 hover:opacity-70 transition-opacity pointer-events-auto hover:cursor-pointer"
            aria-label="Close menu"
          >
            <CloseIcon className="w-6 h-6" />
              </button>
            </div>


            
              {/* for writers reader links */}
              <div className="flex flex-row  gap-6 md:gap-8 w-full border-y-1" >

                <div className="flex-1 flex flex-col py-[32px]">
                  <ThreeLink className="text-[32px] font-bold" noUnderline href="/for-readers-writers#readers">
                    For Readers
                  </ThreeLink>
                  <ThreeLink href="/your-library" noUnderline>
                  Your Library
                  </ThreeLink>
                  <ThreeLink href="/reviews" noUnderline>
                  Reviews
                  </ThreeLink>
                  <ThreeLink href="/newsletter" noUnderline>
                  Newsletter
                  </ThreeLink>
                </div>
                <div className="flex-1 flex flex-col py-[32px] border-l-1">
                  <ThreeLink className="text-[32px] font-bold"  noUnderline href="/for-readers-writers#writers">
                    For Writers
                  </ThreeLink>
                  <ThreeLink href="/submissions" noUnderline>
                    Submissions
                  </ThreeLink>
                  <ThreeLink href="/reviewers" noUnderline>
                  Reviewers
                  </ThreeLink>
                  <ThreeLink href="/influencers" noUnderline>
                  Influencers
                  </ThreeLink>
                </div>
              </div>

              {/* bottom navgation */}
              <div className="flex flex-col items-center gap-[16px] py-[32px]">
                <nav className="flex gap-4">
                  <ThreeLink  href="/"
                  className="text-[32px] font-medium hover:opacity-70 transition-opacity"
                  noUnderline>
                    About
                  </ThreeLink>
                  <ThreeLink  href="/"
                  className="text-[32px] font-medium hover:opacity-70 transition-opacity"
                  noUnderline>
                    Contact
                  </ThreeLink>
                  <ThreeLink  href="/"
                  className="text-[32px] font-medium hover:opacity-70 transition-opacity"
                  noUnderline>
                    Blog
                  </ThreeLink>
                </nav>
                <nav className="flex gap-4 text-center">
                  <ThreeLink  href="/"
                  className="text-base  hover:opacity-70 transition-opacity"
                  noUnderline>
                    Privacy 
                  </ThreeLink>
                  <ThreeLink  href="/"
                  className="text-base  hover:opacity-70 transition-opacity"
                  noUnderline>
                    Legal
                  </ThreeLink>
                </nav>
              </div>
          </div>
          
          </div>

              {/* Background overla text */}
          <div className="flex h-full w-full content-center items-center opacity-[.1] -z-10 absolute top-0 left ">
          <p
        ref={textRef}
        className="text-[45px] text-[#575757] font-bold max-w-[1134px] mx-auto"
      >
            Painted Dog Press is an independent book publisher of fiction and narrative non-fiction. We develop and nurture quality literature and provide writers with a publishing house that continually fosters and markets their work—beyond the efforts of a conventional publisher. Our efforts are strengthened by tech  innovation and human-first technology. Not spotted, or mottled, but painted. Painted Dog is a curated press. My Dog, Spot. A painted dog can be many things— Read About Us →
            </p>


          </div>
        </div>
      )}
    </animated.div>
  );
};
