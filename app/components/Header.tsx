import React from "react";
import Link from "next/link";
import { useSnapshot } from "valtio";
import { filterStore, FilterView } from "../store/filterStore";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Leva } from "leva";
import { bookStore } from "../store/bookStore";
import { BackIcon } from "./icons/Back";
import { ThreeLink } from "./ThreeLink";
import { useMediaQuery } from "usehooks-ts";
import { globalStore } from "../store/globalStore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { animated, useSpring } from "@react-spring/web";
import { authStore } from "@/app/store/authStore";
import { openCart } from "@/app/store/cartUIStore";
import { NewsletterModal } from "./NewsletterModal";

gsap.registerPlugin(ScrollTrigger);

const MenuButton = ({
  shouldStartCollapsed,
}: {
  shouldStartCollapsed: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const underlineSpring = useSpring({
    width: isPressed ? 1 : isHovered ? 1 : -0.0001,
    x: isPressed ? 100 : 0,
    opacity: isHovered && !isPressed ? 1 : 0,
    config: { tension: 400, friction: 25, mass: 1 },
  });

  return (
    <div
      style={
        shouldStartCollapsed
          ? { transform: "translateX(-0.16rem) translateY(1rem)" }
          : { transform: "translateY(1rem) translateX(-0.16rem)" }
      }
      id="menu-button-wrapper"
      className="gap-2 items-center text-black text-[24px]"
    >
      <button
        onClick={() => (globalStore.isMenuOpen = !globalStore.isMenuOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        className="appearance-none uppercase cursor-pointer relative inline-block overflow-hidden pb-1"
      >
        Menu
        <animated.span
          className="absolute left-0 h-0.5 bg-black origin-left text-[0px]"
          style={{
            bottom: "5px",
            width: underlineSpring.width.to((width) => `${width * 100}%`),
            opacity: underlineSpring.opacity
              .to([0, 1], [0, 10])
              .to((opacity) => `${Math.min(opacity, 1)}`),
            transform: underlineSpring.x.to((x) => `translateX(${x}%)`),
          }}
        />
      </button>
    </div>
  );
};

export const Header = () => {
  const { view } = useSnapshot(filterStore);
  const { isRendered, focusedBookId } = useSnapshot(bookStore);
  const { currentRoute } = useSnapshot(globalStore);
  const isGridMode = view === FilterView.Grid;
  const isBookPage = currentRoute.startsWith("/books/");
  const isHomepage = currentRoute === "/";
  const isContactPage = currentRoute === "/contact";
  const isLegalPage = currentRoute === "/legal";
  const isLoginPage = currentRoute === "/login";
  const isOverlayPage = isContactPage || isLegalPage || isLoginPage;
  const isBookFocused = focusedBookId !== null;
  const [showHeader, setShowHeader] = useState(true);
  const [showBackButton, setShowBackButton] = useState(true);
  const isMobile = useMediaQuery("(max-width: 765px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1366px)");

    const [levaLoaded, setLevaLoaded] = useState(false);
    const auth = useSnapshot(authStore);
    const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileBookPageContentRef = useRef<HTMLDivElement>(null);

  // Single ref for entire nav (for fade animation)
  const navRef = useRef<HTMLDivElement>(null);

  // Individual refs (for collapse positioning only)
  const logoRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const rightseparatorRef = useRef<HTMLDivElement>(null);
  const leftseparatorRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartseparatorRef = useRef<HTMLDivElement>(null);

  // Track header hidden state
  const isHeaderHiddenRef = useRef(false);
  const lastScrollYRef = useRef(0);

  const logoYOffset = isMobile ? "0rem" : isTablet ? "-5rem" : "-6.5rem";

  const [shouldStartCollapsed, setShouldStartCollapsed] = useState(
    currentRoute !== "/"
  );

  useEffect(() => {
    setShouldStartCollapsed(currentRoute !== "/");
  }, [currentRoute]);

  // Reset nav opacity when route changes
  useEffect(() => {
    if (navRef.current) {
      gsap.killTweensOf(navRef.current);
      gsap.set(navRef.current, { opacity: 1 });
    }
    isHeaderHiddenRef.current = false;
    lastScrollYRef.current = 0;

    if (isHomepage) {
      const scrollEl = document.getElementById("scroll-el");
      if (scrollEl) {
        scrollEl.scrollTop = 0;
      }
    }
  }, [currentRoute, isHomepage]);

  useEffect(() => {
    if (!isRendered) return;
    scrollContainerRef.current = document.getElementById(
      "scroll-el"
    ) as HTMLDivElement;
    mobileBookPageContentRef.current = document.getElementById(
      "mobile-book-page-content"
    ) as HTMLDivElement;

    setTimeout(() => {
      setLevaLoaded(true);
    }, 1000);

    const handleScroll = () => {
      if (mobileBookPageContentRef.current) {
        setShowBackButton(mobileBookPageContentRef.current.scrollTop <= 300);
      }
    };

    mobileBookPageContentRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      mobileBookPageContentRef.current?.removeEventListener(
        "scroll",
        handleScroll
      );
      setShowBackButton(true);
    };
  }, [isRendered, isMobile, isBookPage, isBookFocused]);

  // GSAP Scroll Animation
  useEffect(() => {
    if (!isRendered) return;

    let ctx: gsap.Context | null = null;

    const timeoutId = setTimeout(() => {
      ctx = gsap.context(() => {
        const menuElement = document.getElementById("menu-button-wrapper");

        if (shouldStartCollapsed) {
          // Set everything to collapsed state immediately
          gsap.set(logoRef.current, { scale: 0.2, y: logoYOffset });
          gsap.set(newsRef.current, { x: 0, fontSize: 16, y: 0 });
          gsap.set(menuElement, { x: 0, fontSize: 16, y: 0 });
          gsap.set(leftseparatorRef.current, { x: 0, opacity: 1, y: -2 });
          gsap.set(rightseparatorRef.current, { x: 0, opacity: 1, y: -2 });
          gsap.set(cartseparatorRef.current, { x: 0, opacity: 1, y: -2 });
          gsap.set(newsletterRef.current, { x: 0, y: 0, fontSize: 16 });
          gsap.set(loginRef.current, { x: 0, y: 0, fontSize: 16 });
          gsap.set(cartRef.current, { x: 0, y: 0, opacity: 1, fontSize: 16 });
          // Ensure nav is visible
          gsap.set(navRef.current, { opacity: 1 });
        } else if (isHomepage) {
          let activeScrollContainer: HTMLDivElement | null = null;

          if (scrollContainerRef.current) {
            activeScrollContainer = scrollContainerRef.current;
          }

          if (!activeScrollContainer) return;

          // Collapse animation timeline
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: activeScrollContainer,
              scroller: activeScrollContainer,
              start: "top top",
              end: "+=400",
              scrub: 1,
            },
          });

          timeline.fromTo(
            logoRef.current,
            { scale: 1, y: 0 },
            { scale: 0.2, duration: 1, y: logoYOffset },
            0
          );

          timeline.fromTo(
            newsRef.current,
            { x: "0.16rem", y: "1rem", fontSize: 24 },
            { x: 0, fontSize: 16, duration: 0.35, y: 0 },
            0
          );

          timeline.fromTo(
            menuElement,
            { x: "-0.16rem", y: "1rem", fontSize: 24 },
            { x: 0, fontSize: 16, duration: 0.35, y: 0 },
            0
          );

          // Separators: stay hidden during collapse, fade in only after menu items are in place
          timeline.fromTo(
            leftseparatorRef.current,
            { opacity: 0, y: 0 },
            { opacity: 1, duration: 0.15, y: -2 },
            0.85
          );

          timeline.fromTo(
            rightseparatorRef.current,
            { opacity: 0, y: 0 },
            { opacity: 1, duration: 0.15, y: -2 },
            0.85
          );

          timeline.fromTo(
            cartseparatorRef.current,
            { opacity: 0, y: 0 },
            { opacity: 1, duration: 0.15, y: -2 },
            0.85
          );

          // Set expanded starting positions before timeline
          gsap.set(newsletterRef.current, {
            x: "-6.5rem",
            y: "16.875rem",
            fontSize: 24,
            opacity: 1,
          });
          gsap.set(loginRef.current, {
            x: "6.5rem",
            y: "16.875rem",
            fontSize: 24,
            opacity: 1,
          });
          gsap.set(cartRef.current, {
            x: 0,
            y: "16.875rem",
            fontSize: 24,
            opacity: 0,
          });

          // Newsletter: fade out at expanded position → snap → fade in at collapsed
          timeline.to(newsletterRef.current, { opacity: 0, duration: 0.1 }, 0);
          timeline.set(
            newsletterRef.current,
            { x: 0, y: 0, fontSize: 16 },
            0.12
          );
          timeline.to(
            newsletterRef.current,
            { opacity: 1, duration: 0.2 },
            0.15
          );

          // Login: fade out at expanded position → snap → fade in at collapsed
          timeline.to(loginRef.current, { opacity: 0, duration: 0.1 }, 0);
          timeline.set(loginRef.current, { x: 0, y: 0, fontSize: 16 }, 0.12);
          timeline.to(loginRef.current, { opacity: 1, duration: 0.2 }, 0.15);

          // Cart: already hidden, snap position → fade in at collapsed
          timeline.set(cartRef.current, { x: 0, y: 0, fontSize: 16 }, 0.12);
          timeline.to(cartRef.current, { opacity: 1, duration: 0.2 }, 0.15);

          // Scroll direction fade - single nav container
          ScrollTrigger.create({
            trigger: activeScrollContainer,
            scroller: activeScrollContainer,
            start: "top top",
            end: "max",
            onUpdate: (self) => {
              const currentScrollY = self.scroll();
              const scrollDelta = currentScrollY - lastScrollYRef.current;
              const minScrollDelta = 5;

              if (currentScrollY > 600) {
                // Scrolling down - hide
                if (
                  scrollDelta > minScrollDelta &&
                  !isHeaderHiddenRef.current
                ) {
                  isHeaderHiddenRef.current = true;
                  gsap.to(navRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    overwrite: true,
                  });
                }
                // Scrolling up - show
                else if (
                  scrollDelta < -minScrollDelta &&
                  isHeaderHiddenRef.current
                ) {
                  isHeaderHiddenRef.current = false;
                  gsap.to(navRef.current, {
                    opacity: 1,
                    duration: 0.3,
                    overwrite: true,
                  });
                }
              } else if (isHeaderHiddenRef.current) {
                // Always visible before 600px
                isHeaderHiddenRef.current = false;
                gsap.to(navRef.current, {
                  opacity: 1,
                  duration: 0.2,
                  overwrite: true,
                });
              }

              lastScrollYRef.current = currentScrollY;
            },
          });
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (ctx) ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isRendered, shouldStartCollapsed, isHomepage, logoYOffset]);

  const handleBackButtonClick = () => {
    bookStore.focusedBookId = null;
  };

  return (
    <div
      className={cn(
        "fixed top-0 h-20 left-0 w-full flex items-center justify-between z-20 font-medium pointer-events-auto px-4 md:px-8"
      )}
    >
      {/* Single nav container for fade animation */}
      <div ref={navRef} className="flex w-full 2xl:max-w-[1320] mx-auto">
        <div className="flex-1 flex text-black">
          {!isBookFocused && (
            <>
              {/* Mobile Logo */}
              <Link className="flex w-40 md:hidden" href="/">
                <Image
                  className="object-contain w-auto lg:h-auto"
                  src="/logo-dog-inline.png"
                  alt="Logo"
                  height={90}
                  width={190}
                />
              </Link>

              <div className="hidden md:flex gap-4 items-center flex-1">
                {/* News */}
                <div
                  ref={newsRef}
                  className="hidden text-[24px] md:flex pointer-events-auto"
                >
                  <ThreeLink animatedUnderline href="/news">
                    <span className="uppercase">News</span>
                  </ThreeLink>
                </div>

                {/* Left Separator */}
                <div className="text-black items-center" ref={leftseparatorRef}>
                  <span>•</span>
                </div>
                {/* Newsletter */}
                <div
                  ref={newsletterRef}
                  className="hidden text-[24px] uppercase md:flex pointer-events-auto"
                >
                  <button
                    onClick={() => setIsNewsletterModalOpen(true)}
                    className="uppercase cursor-pointer"
                  >
                    <span className="uppercase">Newsletter</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            className={cn(
              "text-black flex items-center gap-2 cursor-pointer transition-all duration-300 delay-0 opacity-0 translate-x-5 pointer-events-none group",
              isBookFocused &&
                showBackButton &&
                showHeader &&
                "opacity-100 translate-x-0 delay-400 pointer-events-auto"
            )}
            onClick={handleBackButtonClick}
          >
            <span className="relative w-6 h-[18px] [svg]:w-full [svg]:h-full group-hover:animate-[arrow-bounce_1s_ease-in-out_infinite]">
              <BackIcon />
            </span>
            <span className="text-[19px] font-medium">
              back to {isGridMode ? "grid" : "stack"}
            </span>
          </button>
        </div>

        {/* Logo */}
        {!isBookFocused && !isMobile && (
          <div
            style={
              shouldStartCollapsed
                ? { transform: `translateX(-0.16rem) translateY(-2rem)` }
                : undefined
            }
            ref={logoRef}
            className={cn(
              "fixed px-8 pt-8 md:pt-6 w-full left-0 top-4 block justify-center whitespace-nowrap items-center text-center font-fields font-semibold transition-opacity duration-300 xl:pt-0",
              !showHeader &&
                (isHomepage || isOverlayPage) &&
                "opacity-0 pointer-events-none"
            )}
          >
            <ThreeLink href="/">
              <Image
                className="md:w-auto 2xl:max-w-[1320] xl:mx-auto 2xl:mx-auto"
                src="/logo-dog-inline-hd.png"
                alt="Logo"
                height={6120}
                width={1340}
              />
            </ThreeLink>
          </div>
        )}

        <div
          className={cn(
            "gap-4 items-center flex-1 flex justify-end opacity-100 transition-opacity duration-300 delay-0 pointer-events-auto",
            isBookFocused && "opacity-0 delay-600 pointer-events-none"
          )}
        >
          {/* Cart */}
          <div
            ref={cartRef}
            className="hidden text-[24px] self-start uppercase md:flex items-center pointer-events-auto text-black"
          >
            <button
              className="uppercase relative after:bg-black after:absolute after:h-0.5 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
              onClick={openCart}
            >
              <span>Cart</span>
            </button>
          </div>
          <div
            ref={cartseparatorRef}
            className="text-black hidden md:flex items-center"
          >
            <span>•</span>
          </div>
          {/* Login */}
          <div
            ref={loginRef}
            className="hidden text-[24px] uppercase md:flex gap-2 items-center text-black"
          >
            {auth?.isLoggedIn ? (
              <ThreeLink animatedUnderline href="/dashboard">
                <span className="uppercase">Account</span>
              </ThreeLink>
            ) : (
              <ThreeLink animatedUnderline href="/login">
                <span className="uppercase">Log In</span>
              </ThreeLink>
            )}
          </div>

          {/* Right Separator */}
          <div
            className="text-black hidden md:flex items-center"
            ref={rightseparatorRef}
          >
            <span>•</span>
          </div>

          {/* Menu Button */}
          <div className="hidden md:flex gap-2 items-center text-black">
            <MenuButton shouldStartCollapsed={shouldStartCollapsed} />
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex text-[24px] -mt-8 gap-2 items-center text-black">
            <MenuButton shouldStartCollapsed={shouldStartCollapsed} />
          </div>
        </div>
        <div className="invisible!">
          <Leva hidden />
        </div>
      </div>
      <NewsletterModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
      />
    </div>
  );
};
