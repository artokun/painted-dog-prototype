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
import { animated, useSpring } from "@react-spring/web";
import { authStore } from "@/app/store/authStore";
import { openCart } from "@/app/store/cartUIStore";
import { NewsletterModal } from "./NewsletterModal";

const MenuButton = () => {
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
        className="appearance-none md:uppercase cursor-pointer relative inline-block overflow-hidden pb-1"
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
  const { currentRoute, isNewsLetterModalOpen, landingTransitionProgress } =
    useSnapshot(globalStore);
  const isGridMode = view === FilterView.Grid;
  const isBookPage = currentRoute.startsWith("/books/");
  const isHomepage = currentRoute === "/";
  const isContactPage = currentRoute === "/contact";
  const isLegalPage = currentRoute === "/legal";
  const isLoginPage = currentRoute === "/login";
  const isOverlayPage = isContactPage || isLegalPage || isLoginPage;
  const isBookFocused = focusedBookId !== null;
  const showHeader = true;
  const [showBackButton, setShowBackButton] = useState(true);
  const [scrolledPast, setScrolledPast] = useState(false);
  const isShortViewport = useMediaQuery("(max-height: 699px)");



  const auth = useSnapshot(authStore);
  const [isNewsletterHovered, setIsNewsletterHovered] = useState(false);
  const [isNewsletterPressed, setIsNewsletterPressed] = useState(false);

  const newsletterUnderlineSpring = useSpring({
    width: isNewsletterPressed ? 1 : isNewsletterHovered ? 1 : -0.0001,
    x: isNewsletterPressed ? 100 : 0,
    opacity: isNewsletterHovered && !isNewsletterPressed ? 1 : 0,
    config: { tension: 400, friction: 25, mass: 1 },
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileBookPageContentRef = useRef<HTMLDivElement>(null);

  // Single ref for entire nav (for fade animation)
  const navRef = useRef<HTMLDivElement>(null);

  // Ref for outermost header container (for slide animation)
  const headerRef = useRef<HTMLDivElement>(null);

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

  // Track route-driven collapse transitions
  const hasInitializedRef = useRef(false);
  const prevCollapsedRef = useRef(currentRoute !== "/");
  const isCollapseAnimatingRef = useRef(false);

  // Smoothed collapse progress — creates scrub-like damping lag
  const smoothCollapseRef = useRef({ value: currentRoute !== "/" ? 1 : 0 });
  const collapseTweenRef = useRef<gsap.core.Tween | null>(null);

  const logoCollapsedScale = 0.2;

  const [shouldStartCollapsed, setShouldStartCollapsed] = useState(
    currentRoute !== "/"
  );

  useEffect(() => {
    // Don't snap to collapsed when focusing a book — the fade-out wrapper handles it
    if (!currentRoute.startsWith("/books/")) {
      setShouldStartCollapsed(currentRoute !== "/");
    }
  }, [currentRoute]);

  // Reset nav position when route changes
  useEffect(() => {
    if (navRef.current) {
      gsap.killTweensOf(navRef.current);
      gsap.set(navRef.current, { opacity: 1 });
    }
    if (headerRef.current) {
      gsap.killTweensOf(headerRef.current);
      gsap.set(headerRef.current, { y: 0 });
    }
    isHeaderHiddenRef.current = false;
    lastScrollYRef.current = 0;

    if (isHomepage) {
      setScrolledPast(false);
      const scrollEl = document.getElementById("scroll-container");
      if (scrollEl) {
        scrollEl.scrollTop = 0;
      }
    }
  }, [currentRoute, isHomepage]);

  useEffect(() => {
    if (!isRendered) return;
    scrollContainerRef.current = document.getElementById(
      "scroll-container"
    ) as HTMLDivElement;
    mobileBookPageContentRef.current = document.getElementById(
      "mobile-book-page-content"
    ) as HTMLDivElement;

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
  }, [isRendered, isBookPage, isBookFocused]);

  // Title/header collapse is driven by the same shared normalized progress
  // as landing hero motion to keep page chrome and book animation in sync.
  // Scroll-driven updates use scrub-like damping (smooth lag behind scroll).
  // Route transitions use a longer eased animation.
  useEffect(() => {
    if (!isRendered) return;

    const collapseProgress = shouldStartCollapsed || isShortViewport
      ? 1
      : isHomepage || isBookPage
        ? (scrolledPast ? 1 : 0)
        : 1;
    const mix = gsap.utils.interpolate;

    // Position all header elements based on a 0-1 progress value.
    // Logo + separators: smooth linear interpolation.
    // Nav items: 3-phase crossfade (fade out → snap position → fade in).
    const positionAt = (raw: number) => {
      const p = Math.min(Math.max(raw, 0), 1);
      const logoP = Math.min(Math.max(p / 0.5, 0), 1);
      const sepP = Math.min(Math.max((p - 0.6) / 0.4, 0), 1);
      const menuEl = document.getElementById("menu-button-wrapper");
      const s = (t: gsap.TweenTarget, v: gsap.TweenVars) => {
        if (t) gsap.set(t, v);
      };

      // Logo: scale from top-center — no Y offset needed
      s(logoRef.current, { scale: mix(1, logoCollapsedScale, logoP), transformOrigin: "top center" });

      // Nav items: crossfade (fade out 0-0.3, snap at 0.3, fade in 0.3-0.6)
      const FADE_OUT_END = 0.3;
      const FADE_IN_END = 0.6;
      let itemOpacity: number;
      let collapsed: boolean;
      if (p < FADE_OUT_END) {
        itemOpacity = 1 - p / FADE_OUT_END;
        collapsed = false;
      } else if (p < FADE_IN_END) {
        itemOpacity = (p - FADE_OUT_END) / (FADE_IN_END - FADE_OUT_END);
        collapsed = true;
      } else {
        itemOpacity = 1;
        collapsed = true;
      }

      s(newsRef.current, { x: collapsed ? "0rem" : "0.16rem", y: collapsed ? "0rem" : "1rem", fontSize: collapsed ? 16 : 24, opacity: itemOpacity });
      s(menuEl, { x: collapsed ? "0rem" : "-0.16rem", y: collapsed ? "0rem" : "1rem", fontSize: collapsed ? 16 : 24, opacity: itemOpacity });
      s(newsletterRef.current, { x: collapsed ? "0rem" : "-6.5rem", y: collapsed ? "0rem" : "15.875rem", fontSize: collapsed ? 16 : 24, opacity: itemOpacity });
      s(loginRef.current, { x: collapsed ? "0rem" : "6.5rem", y: collapsed ? "0rem" : "15.875rem", fontSize: collapsed ? 16 : 24, opacity: itemOpacity });
      s(cartRef.current, { x: 0, y: collapsed ? "0rem" : "16.875rem", fontSize: collapsed ? 16 : 24, opacity: collapsed ? itemOpacity : 0 });

      // Separators: fade in after items settle
      s(leftseparatorRef.current, { opacity: sepP, y: mix(0, -2, sepP) });
      s(rightseparatorRef.current, { opacity: sepP, y: mix(0, -2, sepP) });
      s(cartseparatorRef.current, { opacity: sepP, y: mix(0, -2, sepP) });

      s(navRef.current, { opacity: 1 });
    };

    // Detect route-driven collapse change (not initial render, not scroll)
    const collapsedChanged = shouldStartCollapsed !== prevCollapsedRef.current;
    const isRouteTransition = hasInitializedRef.current && collapsedChanged;

    // Skip scroll-driven updates while a route transition animation is playing
    if (!isRouteTransition && isCollapseAnimatingRef.current) {
      prevCollapsedRef.current = shouldStartCollapsed;
      return;
    }

    if (isRouteTransition) {
      // Route change — animate with easing (home ↔ other page)
      isCollapseAnimatingRef.current = true;
      collapseTweenRef.current?.kill();
      collapseTweenRef.current = gsap.to(smoothCollapseRef.current, {
        value: collapseProgress,
        duration: 0.4,
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: () => positionAt(smoothCollapseRef.current.value),
        onComplete: () => {
          isCollapseAnimatingRef.current = false;
        },
      });
    } else if (!hasInitializedRef.current) {
      // First render — snap instantly, no damping
      smoothCollapseRef.current.value = collapseProgress;
      positionAt(collapseProgress);
    } else {
      // Scroll threshold crossed
      const isExpanding = collapseProgress === 0;
      collapseTweenRef.current?.kill();
      collapseTweenRef.current = gsap.to(smoothCollapseRef.current, {
        value: collapseProgress,
        duration: isExpanding ? 0.5 : 1,
        ease: isExpanding ? "power2.inOut" : "power2.out",
        overwrite: true,
        onUpdate: () => positionAt(smoothCollapseRef.current.value),
      });
    }

    hasInitializedRef.current = true;
    prevCollapsedRef.current = shouldStartCollapsed;

    return () => {
      collapseTweenRef.current?.kill();
    };
  }, [
    isRendered,
    isHomepage,
    isBookPage,
    shouldStartCollapsed,
    scrolledPast,
    isShortViewport,
    logoCollapsedScale,
  ]);

  useEffect(() => {
    if (!isRendered) return;

    let activeContainer: HTMLElement | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const getContainerId = (): string | null => {
      if (isHomepage) return "scroll-container";
      if (currentRoute.startsWith("/news/"))
        return "news-slug-page-scroll-container";
      if (currentRoute.startsWith("/books/"))
        return "mobile-book-page-content";

      const containerMap: Record<string, string> = {
        "/about": "about-page-scroll-container",
        "/contact": "contact-page-scroll-container",
        "/legal": "legal-page-scroll-container",
        "/login": "login-page-scroll-container",
        "/dashboard": "dashboard-page-scroll-container",
        "/news": "news-page-scroll-container",
      };

      return containerMap[currentRoute] ?? null;
    };

    // Homepage needs higher threshold so it doesn't fight the collapse motion.
    const hideThreshold = isHomepage ? 400 : 100;

    const handleDirectionScroll = () => {
      if (!activeContainer) return;
      const currentScrollY = activeContainer.scrollTop;

      // Collapse trigger: 50px threshold on homepage
      if (isHomepage) {
        setScrolledPast(currentScrollY > 0);
      }

      if (currentScrollY > hideThreshold) {
        if (
          currentScrollY > lastScrollYRef.current &&
          !isHeaderHiddenRef.current
        ) {
          // Scrolling down - slide header up off-screen
          isHeaderHiddenRef.current = true;
          gsap.to(headerRef.current, {
            y: "-10rem",
            duration: 0.3,
            ease: "power2.in",
            overwrite: true,
          });
        } else if (
          currentScrollY < lastScrollYRef.current &&
          isHeaderHiddenRef.current
        ) {
          // Scrolling up - slide header back down
          isHeaderHiddenRef.current = false;
          gsap.to(headerRef.current, {
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
        }
      } else if (isHeaderHiddenRef.current) {
        // Always visible near top of page
        isHeaderHiddenRef.current = false;
        gsap.to(headerRef.current, {
          y: 0,
          duration: 0.2,
          overwrite: true,
        });
      }

      lastScrollYRef.current = currentScrollY;
    };

    // Retry finding the scroll container — server-rendered pages may not
    // have their DOM ready when this effect first runs.
    const tryAttach = (retries = 10) => {
      const containerId = getContainerId();
      if (!containerId) return;

      const el = document.getElementById(containerId);
      if (el) {
        activeContainer = el;
        el.addEventListener("scroll", handleDirectionScroll);
      } else if (retries > 0) {
        retryTimer = setTimeout(() => tryAttach(retries - 1), 80);
      }
    };

    tryAttach();

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      activeContainer?.removeEventListener("scroll", handleDirectionScroll);
    };
  }, [isRendered, isHomepage, currentRoute]);

  const handleBackButtonClick = () => {
    bookStore.focusedBookId = null;
  };

  return (
    <div
      ref={headerRef}
      className={cn(
        "fixed top-0 h-20 left-0 w-full flex items-center justify-between z-20 font-medium pointer-events-auto px-4 md:px-8"
      )}
    >
      {/* Single nav container for fade animation */}
      <div ref={navRef} className="flex w-full lg:max-w-[1320px] mx-auto">
        <div className="flex text-black z-[9]">
          <div
            style={{
              opacity: isBookFocused ? 0 : 1,
              pointerEvents: isBookFocused ? "none" : "auto",
            }}
          >
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
                    onClick={() => (globalStore.isNewsLetterModalOpen = true)}
                    onMouseEnter={() => setIsNewsletterHovered(true)}
                    onMouseLeave={() => {
                      setIsNewsletterHovered(false);
                      setIsNewsletterPressed(false);
                    }}
                    onMouseDown={() => setIsNewsletterPressed(true)}
                    className="appearance-none uppercase cursor-pointer relative inline-block overflow-hidden pb-1"
                  >
                    <span className="uppercase">Newsletter</span>
                    <animated.span
                      className="absolute left-0 h-0.5 bg-black origin-left text-[0px]"
                      style={{
                        bottom: "5px",
                        width: newsletterUnderlineSpring.width.to(
                          (width) => `${width * 100}%`
                        ),
                        opacity: newsletterUnderlineSpring.opacity
                          .to([0, 1], [0, 10])
                          .to((opacity) => `${Math.min(opacity, 1)}`),
                        transform: newsletterUnderlineSpring.x.to(
                          (x) => `translateX(${x}%)`
                        ),
                      }}
                    />
                  </button>
                </div>
              </div>
          </div>

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
        <div
            className="fixed inset-0 w-full hidden md:block"
            style={{
              opacity: isBookFocused ? 0 : 1,
              pointerEvents: isBookFocused ? "none" : "auto",
            }}
          >
            <div
              id="home-title-logo"
              ref={logoRef}
              className={cn(
                "fixed pt-8 px-8 md:pt-6 w-full left-0 top-4 block justify-center whitespace-nowrap items-center text-center font-fields font-semibold xl:pt-0",
                !showHeader &&
                  (isHomepage || isOverlayPage) &&
                  "opacity-0 pointer-events-none"
              )}
            >
              <ThreeLink href="/">
                <Image
                  className="md:w-auto 2xl:max-w-[1320px] xl:mx-auto 2xl:mx-auto"
                  src="/logo-dog-inline-hd.png"
                  alt="Logo"
                  height={6120}
                  width={1340}
                />
              </ThreeLink>
            </div>
          </div>

        <div
          className={cn(
            "gap-4 items-center flex-1 flex justify-end pointer-events-auto",
            isBookFocused && "opacity-0 pointer-events-none"
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
            <MenuButton />
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex text-[24px] -mt-8 gap-2 items-center text-black">
            <MenuButton />
          </div>
        </div>
        <div className="invisible!">
          <Leva hidden />
        </div>
      </div>
      <NewsletterModal
        isOpen={isNewsLetterModalOpen}
        onClose={() => (globalStore.isNewsLetterModalOpen = false)}
      />
    </div>
  );
};
