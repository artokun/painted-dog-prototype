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

export const Foreground = ({ visible }: { visible: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isRendered } = useSnapshot(bookStore);
  const { currentRoute, isMenuOpen } = useSnapshot(globalStore);
  const isAboutPage = currentRoute === "/about";
  const isContactPage = currentRoute === "/contact";
  const isLegalPage = currentRoute === "/legal";
  const isLoginPage = currentRoute === "/login";
  const isDashboardPage = currentRoute === "/dashboard";

  const isNotFound = currentRoute === "/not-found";
  const [wasVisible, setWasVisible] = useState(visible);

  // Hide floating bar - hardcode to false instead of using Leva controls
  const showFloatingBar = false;

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
      <AboutPageContent visible={isAboutPage} />
      <ContactPageContent visible={isContactPage} />
      <LegalPageContent visible={isLegalPage} />
      <LoginPageComponent visible={isLoginPage} />
      <Dashboard visible={isDashboardPage} />
      <NotFoundContent visible={isNotFound} />
      <MenuOverlay visible={isMenuOpen} />
      <Loader />
    </div>
  );
};
