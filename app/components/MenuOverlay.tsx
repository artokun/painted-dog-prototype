"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { animated, useSpring } from "@react-spring/web";
import { ThreeLink } from "./ThreeLink";
import { cn } from "@/lib/utils";
import { useSnapshot } from "valtio";
import { globalStore } from "../store/globalStore";
import { CloseIcon } from "./icons/Close";
import { openCart } from "@/app/store/cartUIStore"; // Import open function

// import { useMediaQuery } from "usehooks-ts";
import { gsap } from "gsap";
import { SplitText } from "gsap/dist/SplitText";
import SocialLiniks from "./ecommerce/SocialLiniks";

// Register the plugin
gsap.registerPlugin(SplitText);

export const MenuOverlay = ({ visible }: { visible: boolean }) => {
  const [showContent, setShowContent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const menuRef = useRef<HTMLParagraphElement>(null);

  // const isMobile = useMediaQuery("(max-width: 768px)");
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
    if (!textRef.current || !visible || !showContent) return;

    let split: SplitText | null = null;

    const timeoutId = setTimeout(() => {
      if (!textRef.current) return;

      // Split into words AND chars - preserves word boundaries
      split = new SplitText(textRef.current, {
        type: "words, chars",
        wordsClass: "word",
        charsClass: "char",
      });

      // Keep words together
      gsap.set(split.words, {
        display: "inline-block",
      });

      gsap.set(split.chars, {
        opacity: 0,
        y: 20,
        rotationX: -90,
      });

      gsap.to(split.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: "back.out(1.7)",
        delay: 0.3,
      });

      // Note: menuRef needs .current if it's a ref
      gsap.to(menuRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.3,
      });
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      split?.revert();
    };
  }, [visible, showContent]);

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
    delay: visible ? 300 : 0, // Remove delay on close
    config: visible
      ? { tension: 280, friction: 60 } // Smooth open
      : { tension: 400, friction: 40, clamp: true }, // Fast close with clamp
    onStart: () => {
      if (visible) {
        setShowContent(true);
      }
    },
    onRest: () => {
      if (!visible) {
        setShowContent(false);
      }
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

          {/* Menu Content */}
          <div
            ref={menuRef}
            className="flex torn-all-xs flex-col items-center self-center justify-center p-4  bg-white w-[90%]  md:w-full lg:rotate-1 lg:max-w-[829px]"
          >
            <div className="flex flex-col w-full outline-[#575757] outline-[1.74px] outline-offset-2 border-[4.36px] border-[#575757]">
              {/* main navigation */}
              <div className="flex flex-col items-center md:flex-row justify-between w-full px-6 md:px-[41px] py-8">
                <button
                  onClick={handleClose}
                  className="p-2 flex md:hidden self-end hover:opacity-70 transition-opacity pointer-events-auto hover:cursor-pointer"
                  aria-label="Close menu"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
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
                  className="text-[18px] uppercase item-center hidden md:flex md:text-[20.92px] font-semibold hover:opacity-70 transition-opacity"
                  noUnderline
                >
                  Login
                </ThreeLink>
                <ThreeLink
                  href="/dashboard"
                  className="text-[18px] hidden md:flex uppercase md:text-[20.92px] font-semibold hover:opacity-70 transition-opacity"
                  noUnderline
                >
                  Account
                </ThreeLink>
                <button
                  className="text-[18px] uppercase hidden md:flex md:text-[20.92px] font-semibold hover:opacity-70 transition-opacity hover:cursor-pointer"
                  onClick={openCart}
                >
                  Cart
                </button>
                <div className="flex flex-row gap-5  justify-between w-full pt-8 md:hidden">
                  <ThreeLink
                    href="/login"
                    className="text-[18px] uppercase md:text-[20.92px] font-semibold hover:opacity-70 transition-opacity"
                    noUnderline
                  >
                    Login
                  </ThreeLink>
                  <ThreeLink
                    href="/dashboard"
                    className="text-[18px] uppercase md:text-[20.92px] font-semibold hover:opacity-70 transition-opacity"
                    noUnderline
                  >
                    Account
                  </ThreeLink>
                  <button
                    className="text-[18px] uppercase md:text-[20.92px] font-semibold hover:opacity-70 transition-opacity hover:cursor-pointer"
                    onClick={openCart}
                  >
                    Cart
                  </button>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hidden md:flex items-center hover:opacity-70 transition-opacity pointer-events-auto hover:cursor-pointer"
                  aria-label="Close menu"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              {/* for writers reader links */}
              <div className="flex flex-col md:flex-row  gap-6 w-full border-y">
                <div className="flex-1 flex flex-col py-8 gap-2">
                  <ThreeLink
                    className="text-[24px] md:text-[32px] font-semibold"
                    noUnderline
                    href="/for-readers-writers#readers"
                  >
                    For Readers
                  </ThreeLink>
                  <ThreeLink href="/newsletter" noUnderline>
                    Newsletter
                  </ThreeLink>
                  <ThreeLink href="/newsletter" noUnderline>
                    Browse Stack
                  </ThreeLink>
                </div>
                <div className="flex-1 flex flex-col py-8 md:border-l">
                  <ThreeLink
                    className="text-[24px] md:text-[32px] font-semibold"
                    noUnderline
                    href="/for-readers-writers#writers"
                  >
                    For Writers
                  </ThreeLink>

                  <ThreeLink href="/contact" noUnderline>
                    Submissions
                  </ThreeLink>
                </div>
              </div>

              {/* bottom navgation */}
              <div className="flex flex-col items-center gap-4 py-8">
                <nav className="flex gap-4">
                  <ThreeLink
                    href="/about"
                    className="text-[24px] md:text-[32px] font-semibold hover:opacity-70 transition-opacity"
                    noUnderline
                  >
                    About
                  </ThreeLink>
                  <ThreeLink
                    href="/contact"
                    className="text-[24px] md:text-[32px] font-semibold hover:opacity-70 transition-opacity"
                    noUnderline
                  >
                    Contact
                  </ThreeLink>
                  <ThreeLink
                    href="/blog"
                    className="text-[24px] md:text-[32px] font-semibold hover:opacity-70 transition-opacity"
                    noUnderline
                  >
                    News
                  </ThreeLink>
                </nav>
                <nav className="flex gap-4 text-center">
                  <ThreeLink
                    href="/privacy"
                    className="text-[13px] hover:opacity-70 transition-opacity"
                    noUnderline
                  >
                    Privacy
                  </ThreeLink>
                  <ThreeLink
                    href="/legal"
                    className="text-[13px]  hover:opacity-70 transition-opacity"
                    noUnderline
                  >
                    Legal
                  </ThreeLink>
                </nav>
                <div className="flex md:hidden">
                  <SocialLiniks />
                </div>
              </div>
            </div>
          </div>

          {/* Background overla text */}
          <div className="flex h-full w-full content-center items-center  -z-10 absolute top-0 left ">
            <p
              ref={textRef}
              className="text-[45px] text-[#000000] opacity-[.03] font-semibold max-w-[1134px] mx-auto"
            >
              Painted Dog Press is an independent book publisher of fiction and
              narrative non-fiction. We develop and nurture quality literature
              and provide writers with a publishing house that continually
              fosters and markets their work—beyond the efforts of a
              conventional publisher. Our efforts are strengthened by tech
              innovation and human-first technology. Not spotted, or mottled,
              but painted. Painted Dog is a curated press. My Dog, Spot. A
              painted dog can be many things — Read About Us
            </p>
          </div>
        </div>
      )}
    </animated.div>
  );
};
