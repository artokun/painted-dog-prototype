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
import { NewsletterModal } from "./NewsletterModal";

// import { useMediaQuery } from "usehooks-ts";
import { gsap } from "gsap";
import { SplitText } from "gsap/dist/SplitText";
import SocialLiniks from "./ecommerce/SocialLiniks";

// Register the plugin
gsap.registerPlugin(SplitText);

export const MenuOverlay = ({ visible }: { visible: boolean }) => {
  const [showContent, setShowContent] = useState(false);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
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
    if (!textRef.current || !visible || !showContent || !menuRef.current)
      return;
    // Split into words AND chars - preserves word boundaries
    gsap.set(textRef.current, { opacity: 0, y: 20 });
    gsap.set(menuRef.current, { opacity: 0, y: 0 });

    gsap.to(textRef.current, {
      opacity: 0.03,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.3,
    });

    gsap.to(menuRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.2,
    });
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
        <div className="flex flex-col h-full md:justify-center md:px-4 xl:px-0 min-h-full pt-[104px] md:pt-0">
          {/* Close Button */}

          {/* Menu Content */}
          <div
            ref={menuRef}
            className="flex torn-paper flex-col items-center self-center justify-center p-4  bg-white w-[90%]  md:w-full lg:rotate-1 lg:max-w-[829px]"
          >
            <div className="torn-right"></div>
            <div className="torn-bottom"></div>
            <div className="flex flex-col w-full outline-[#575757] outline-[1.74px] outline-offset-2 border-[4.36px] border-[#575757]">
              {/* main navigation */}
              <div className="flex flex-col items-center relative md:flex-row justify-between w-full px-6 md:px-[41px] py-8">
                <button
                  onClick={handleClose}
                  className="p-0  md:p-2  flex absolute right-[1rem] md:hidden self-end hover:opacity-70 transition-opacity pointer-events-auto hover:cursor-pointer"
                  aria-label="Close menu"
                >
                  <CloseIcon className="text-[24px] w-6 h-6 size-[24.42px]" />
                </button>
                <ThreeLink className="w-[90%] md:max-w-[180px]" href="/">
                  <Image
                    src="/pp-overlay-logo.png"
                    alt="Logo"
                    width={220}
                    height={85}
                    className="w-full h-full"
                  />
                </ThreeLink>
                <ThreeLink
                  href="/login"
                  className="text-[18px] uppercase item-center hidden md:flex md:text-[20.92px] font-semibold"
                  animatedUnderline
                >
                  <span> Login</span>
                </ThreeLink>
                <ThreeLink
                  href="/dashboard"
                  className="text-[18px] hidden md:flex uppercase md:text-[20.92px] font-semibold"
                  animatedUnderline
                >
                  <span>Account</span>
                </ThreeLink>
                <button
                  className="text-[18px] uppercase relative hidden md:flex md:text-[20.92px] font-semibold hover:cursor-pointer after:bg-black after:absolute after:h-0.5 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
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
                  <CloseIcon className="size-[24.42px]" />
                </button>
              </div>

              {/* for writers reader links */}
              <div className="flex flex-col md:flex-row  w-full border-y">
                <div className="flex-1 border-b md:border-b-0 flex flex-col py-8 gap-2">
                  <ThreeLink
                    className="text-[24px] md:text-[32px] font-semibold"
                    noUnderline
                    href="/for-readers-writers#readers"
                  >
                    For Readers
                  </ThreeLink>
                  <button
                    onClick={() => setIsNewsletterModalOpen(true)}
                    className="w-fit mx-auto relative after:bg-black after:absolute after:h-0.5 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
                    type="button"
                    tabIndex={0}
                    aria-label="Open newsletter modal"
                  >
                    Newsletter
                  </button>
                  <ThreeLink
                    className="w-fit mx-auto"
                    href="/"
                    animatedUnderline
                  >
                    Browse Stack
                  </ThreeLink>
                </div>
                <div className="flex-1 flex flex-col py-8 md:border-l">
                  <ThreeLink
                    className="text-[24px] md:text-[32px] font-semibold"
                    noUnderline
                    href="#"
                  >
                    <span> For Writers</span>
                  </ThreeLink>

                  <ThreeLink
                    className="w-fit mx-auto"
                    href="/contact"
                    animatedUnderline
                  >
                    <span>Submissions</span>
                  </ThreeLink>
                </div>
              </div>

              {/* bottom navgation */}
              <div className="flex flex-col items-center gap-4 py-8">
                <nav className="flex gap-4">
                  <ThreeLink
                    href="/about"
                    className="text-[24px] md:text-[32px] font-semibold"
                    animatedUnderline
                  >
                    <span>About</span>
                  </ThreeLink>
                  <ThreeLink
                    href="/contact"
                    className="text-[24px] md:text-[32px] font-semibold"
                    animatedUnderline
                  >
                    <span>Contact</span>
                  </ThreeLink>
                  <ThreeLink
                    href="/news"
                    className="text-[24px] md:text-[32px] font-semibold"
                    animatedUnderline
                  >
                    <span>News</span>
                  </ThreeLink>
                </nav>
                <nav className="flex gap-4 text-center">
                  <ThreeLink
                    href="/privacy"
                    className="text-[13px] hover:opacity-70 transition-opacity"
                    animatedUnderline
                  >
                    Privacy
                  </ThreeLink>
                  <ThreeLink
                    href="/legal"
                    className="text-[13px]  hover:opacity-70 transition-opacity"
                    animatedUnderline
                  >
                    Legal
                  </ThreeLink>
                </nav>
                <div className="flex">
                  <SocialLiniks />
                </div>
              </div>
            </div>
          </div>

          {/* Background overla text */}
          <div className="flex h-full w-full content-center items-center  -z-10 absolute top-0 left ">
            <p
              ref={textRef}
              className="hidden text-center md:flex text-[56px] leading-normal text-[#000000] opacity-[.03] font-[500] max-w-[1134px] mx-auto"
            >
              Painted Dog Press is an independent book publisher of fiction and
              narrative non-fiction. We develop and nurture quality literature
              and provide writers with a publishing house that continually
              fosters and markets their work—beyond the efforts of a
              conventional publisher. Our efforts are strengthened by tech
              innovation and human-first technology. Not spotted, or mottled,
              but painted. Painted Dog is a curated press. My Dog, Spot. A
              painted dog can be many things
            </p>
          </div>
        </div>
      )}
      <NewsletterModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
      />
    </animated.div>
  );
};
