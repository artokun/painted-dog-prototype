"use client";

import { Header } from "./Header";
import { FloatingBar } from "./FloatingBar";
import { Loader } from "@react-three/drei";
import { usePathname, useRouter } from "next/navigation";
import { globalStore } from "../store/globalStore";
import { useEffect, useState } from "react";
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
import { ForgotPasswordModal } from "./ForgotPasswordModal"; // NEW
import {
  forgotPasswordStore,
  closeForgotPassword,
} from "../store/forgotPasswordStore";
import { ResetPasswordModal } from "@/app/components/ResetPasswordModal"; // NEW
import { openResetPassword } from "@/app/store/resetPasswordStore";

export const Foreground = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isRendered } = useSnapshot(bookStore);
  const { currentRoute, isMenuOpen } = useSnapshot(globalStore);
  const { isOpen: isCartOpen } = useSnapshot(cartUIStore); // Subscribe to cart state
  
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const { isOpen: isForgotPasswordOpen } = useSnapshot(forgotPasswordStore);

  const isAboutPage = currentRoute === "/about";
  const isContactPage = currentRoute === "/contact";
  const isLegalPage = currentRoute === "/legal";
  const isLoginPage = currentRoute === "/login";
  const isDashboardPage = currentRoute === "/dashboard";

  const isNotFound = currentRoute === "/not-found";
  // const [wasVisible, setWasVisible] = useState(visible);

  // Hide floating bar - hardcode to false instead of using Leva controls
  const showFloatingBar = false;

  // Restore auth session from httpOnly cookie on mount
  useEffect(() => {
    hydrateAuth();
  }, []);

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

  // Inside the component, add this useEffect:
  useEffect(() => {
    // Detect reset password URL
    const match = pathname.match(/^\/account\/reset\/([^/]+)\/([^/]+)$/);
    if (match) {
      const [, customerId, token] = match;
      openResetPassword(customerId, token);
      // Navigate to home so URL is clean
      router.push("/");
    }
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
      <AboutPageContent visible={isAboutPage} aboutContent={aboutContent} />
      <ContactPageContent visible={isContactPage} />
      <LegalPageContent visible={isLegalPage} />
      <LoginPageComponent visible={isLoginPage} />
      <Dashboard visible={isDashboardPage} />
      <NotFoundContent visible={isNotFound} />
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
  );
};
