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
import { ContactPageContent } from "./ContactPageContent";
import { LegalPageContent } from "./LegalPageContent";
import { NotFoundContent } from "./NotFoundContent";
import { Cursor } from "./Cursor";
import { MenuOverlay } from "./MenuOverlay";
import { AboutPageContent } from "./AboutPageContent";
import { LoginPageComponent } from "./LoginPageComponent";
import { Dashboard } from "./ecommerce/Dashboard";
import { cartUIStore, closeCart } from "../store/cartUIStore";
import { CartSidebar } from "./ecommerce/CartSidebar";
import { hydrateAuth } from "../store/authStore";
import type { AboutContent } from "@/lib/about";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import {
  forgotPasswordStore,
  closeForgotPassword,
} from "../store/forgotPasswordStore";
import { ResetPasswordModal } from "@/app/components/ResetPasswordModal";
import { openResetPassword } from "@/app/store/resetPasswordStore";
import { HomeContent } from "./HomeContent";
import { cn } from "@/lib/utils";
import { HOME_COLLAPSE_SCROLL_RANGE_PX } from "@/app/constants/motion";
import { PageSlot } from "./PageSlot";

export const Foreground = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isRendered, focusedBookId } = useSnapshot(bookStore);
  const { currentRoute, isMenuOpen } = useSnapshot(globalStore);
  const { isOpen: isCartOpen } = useSnapshot(cartUIStore);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const focusRouteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const { isOpen: isForgotPasswordOpen } = useSnapshot(forgotPasswordStore);

  const isHomePage = currentRoute === "/";

  const isAboutPage = currentRoute === "/about";
  const isContactPage = currentRoute === "/contact";
  const isLegalPage = currentRoute === "/legal";
  const isLoginPage = currentRoute === "/login";
  const isDashboardPage = currentRoute === "/dashboard";

  const isNotFound = currentRoute === "/not-found";
  // const [wasVisible, setWasVisible] = useState(visible);

  // Hide floating bar - hardcode to false instead of using Leva controls
  const showFloatingBar = false;

  const updateFeaturedBookAnchor = useCallback(() => {
    if (globalStore.currentRoute !== "/") {
      if (globalStore.featuredBookAnchorNdcY !== 0) {
        globalStore.featuredBookAnchorNdcY = 0;
      }
      return;
    }

    const titleEl = document.getElementById("home-title-logo");
    const copyStartEl = document.getElementById("home-copy-start");

    if (!titleEl || !copyStartEl) return;

    const viewportHeight = window.innerHeight;
    const titleRect = titleEl.getBoundingClientRect();
    const copyRect = copyStartEl.getBoundingClientRect();
    const clampedTitleBottom = Math.min(
      Math.max(titleRect.bottom, 0),
      viewportHeight
    );
    const clampedCopyTop = Math.min(Math.max(copyRect.top, 0), viewportHeight);
    const midpointY = (clampedTitleBottom + clampedCopyTop) / 2;
    const ndcY = Math.min(Math.max(1 - (midpointY / viewportHeight) * 2, -1), 1);

    if (Math.abs(globalStore.featuredBookAnchorNdcY - ndcY) > 0.0005) {
      globalStore.featuredBookAnchorNdcY = ndcY;
    }
  }, []);

  // Restore auth session from httpOnly cookie on mount
  useEffect(() => {
    hydrateAuth();
  }, []);

  // Sync native scroll to globalStore.scrollProgress + scrollPages
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const syncScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      globalStore.scrollProgress = Math.min(Math.max(progress, 0), 1);
      globalStore.overlayScrollPosition = scrollTop;
      // Shared 0-1 progress for homepage hero motion (header/title + featured book insert)
      globalStore.landingTransitionProgress = Math.min(
        Math.max(scrollTop / HOME_COLLAPSE_SCROLL_RANGE_PX, 0),
        1
      );
      updateFeaturedBookAnchor();
      // Keep scrollPages in sync for camera Y travel calculation
      globalStore.scrollPages = Math.max(scrollHeight / clientHeight, 1);
    };

    container.addEventListener("scroll", syncScroll, { passive: true });
    syncScroll();

    // Recompute on resize
    const observer = new ResizeObserver(syncScroll);
    observer.observe(container);

    return () => {
      container.removeEventListener("scroll", syncScroll);
      observer.disconnect();
    };
  }, [updateFeaturedBookAnchor]);

  // Forward wheel and touch events to scroll container
  // (container is pointer-events-none so it can't receive events directly,
  // but we need Canvas to stay clickable)
  const touchStartY = useRef(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const canScroll =
      isHomePage && focusedBookId === null && !isMenuOpen && !isCartOpen;

    const handleWheel = (e: WheelEvent) => {
      if (canScroll) {
        container.scrollTop += e.deltaY;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (canScroll && e.touches.length === 1) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (canScroll && e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const deltaY = touchStartY.current - currentY;
        container.scrollTop += deltaY;
        touchStartY.current = currentY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isHomePage, focusedBookId, isMenuOpen, isCartOpen]);

  // Reset scroll when leaving home or focusing a book
  useEffect(() => {
    if (scrollContainerRef.current && (!isHomePage || focusedBookId)) {
      scrollContainerRef.current.scrollTop = 0;
      globalStore.scrollProgress = 0;
      globalStore.overlayScrollPosition = 0;
      globalStore.landingTransitionProgress = 0;
      globalStore.featuredBookAnchorNdcY = 0;
    }
  }, [isHomePage, focusedBookId]);

  // Fetch about content when needed
  useEffect(() => {
    if (isAboutPage) {
      fetch("/api/about?t=" + Date.now()) // Cache bust
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setAboutContent(data.data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch about content:", error);
        });
    }
  }, [isAboutPage]);

  // This sets the current route to the pathname when the pathname changes
  useEffect(() => {
    if (!pathname.startsWith("/books/")) {
      bookStore.focusedBookId = null;
    }

    if (pathname !== "/login") {
      globalStore.previousRoute = globalStore.currentRoute;
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
        if (focusRouteTimerRef.current) {
          clearTimeout(focusRouteTimerRef.current);
          focusRouteTimerRef.current = null;
        }

        const book = focusedBookId ? bookStore.books[focusedBookId] : null;
        if (focusedBookId && book?.slug) {
          router.push(`/books/${book.slug}`);
        } else {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
          }
          globalStore.scrollProgress = 0;
          globalStore.overlayScrollPosition = 0;
          globalStore.landingTransitionProgress = 0;
          globalStore.featuredBookAnchorNdcY = 0;
          // Let the 3D book unfocus animation play before swapping back to home route.
          focusRouteTimerRef.current = setTimeout(() => {
            router.push("/");
            focusRouteTimerRef.current = null;
          }, 220);
        }
      }
    );

    return () => {
      if (focusRouteTimerRef.current) {
        clearTimeout(focusRouteTimerRef.current);
        focusRouteTimerRef.current = null;
      }
      unsubscribeCurrentRoute();
      unsubscribeFocusedBookId();
    };
  }, [pathname]);

  // Detect reset password URL and open modal
  useEffect(() => {
    const match = pathname.match(/^\/account\/reset\/([^/]+)\/([^/]+)$/);
    if (match) {
      const [, customerId, token] = match;
      openResetPassword(customerId, token);
      // Navigate to home so URL is clean
      router.push("/");
    }
  }, [pathname]);

  return (
    <>
      {/* Native Scroll Container — sits between Canvas (z-0) and UI overlay (z-20) */}
      <div
        ref={scrollContainerRef}
        id="scroll-container"
        className={cn(
          "absolute inset-0 z-10 overflow-y-auto overflow-x-hidden pointer-events-none",
          (isMenuOpen || isCartOpen || !isHomePage || focusedBookId) &&
            "overflow-hidden"
        )}
      >
        <HomeContent />
      </div>

      {/* UI Overlay — fixed on top, pointer-events-none with selective auto on children */}
      <div
        id="foreground"
        className="absolute top-0 left-0 h-full w-full flex items-center justify-center flex-col z-20 pointer-events-none"
      >
        <Header />
        {showFloatingBar && <FloatingBar />}
        <PageSlot>
          <BookPageContent />
          <AboutPageContent visible={isAboutPage} aboutContent={aboutContent} />
          <ContactPageContent visible={isContactPage} />
          <LegalPageContent visible={isLegalPage} />
          <LoginPageComponent visible={isLoginPage} />
          <Dashboard visible={isDashboardPage} />
          <NotFoundContent visible={isNotFound} />
        </PageSlot>
        <Cursor />
        <MenuOverlay visible={isMenuOpen} />

        {/* Cart Sidebar - Single instance at top level */}
        <CartSidebar isOpen={isCartOpen} onClose={closeCart} />

        {/*Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={closeForgotPassword}
        />

        <ResetPasswordModal />

        <Loader />
      </div>
    </>
  );
};
