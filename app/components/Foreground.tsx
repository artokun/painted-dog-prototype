"use client";

import { Header } from "./Header";
import { FloatingBar } from "./FloatingBar";
import { Loader, useScroll } from "@react-three/drei";
import { usePathname, useRouter } from "next/navigation";
import { globalStore } from "../store/globalStore";
import { useEffect, useState } from "react";
import { subscribeKey } from "valtio/utils";
import { bookStore } from "../store/bookStore";
import { useSnapshot } from "valtio";
import BookPageContent from "./BookPageContent";
import { useControls } from "leva";
import { useSpring, animated } from "@react-spring/web";
import { cn } from "@/lib/utils";

export const Foreground = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isRendered } = useSnapshot(bookStore);

  const { showFloatingBar } = useControls(
    "UI",
    {
      showFloatingBar: {
        value: false,
        label: "Filters",
      },
    },
    { collapsed: true }
  );

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
      <Loader />
    </div>
  );
};

const Cursor = () => {
  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const { hoveredBookId, focusedBookId } = useSnapshot(bookStore);
  const [pressed, setPressed] = useState(false);
  const [text, setText] = useState("Focus Book");

  const style = useSpring({
    x: mousePosition.x,
    y: mousePosition.y,
    immediate: true,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const TIME = 200;
    setPressed(true);
    setTimeout(() => {
      setText(!focusedBookId ? "Flip Book" : "Focus Book");
    }, TIME / 2);
    setTimeout(() => {
      setText(focusedBookId ? "Flip Book" : "Focus Book");
      setPressed(false);
    }, TIME);
  }, [focusedBookId]);

  return (
    <animated.div
      style={style}
      className="absolute top-0 left-0 h-20 w-20 translate-x-[-50%] translate-y-[-50%]"
    >
      <div
        className={cn(
          "flex items-center justify-center bg-black rounded-full text-white w-full h-full text-center leading-none p-2 transition-all duration-200",
          hoveredBookId ? "opacity-100" : "opacity-0",
          pressed ? "scale-50" : hoveredBookId ? "scale-100" : "scale-0"
        )}
      >
        <span className={cn(pressed ? "opacity-0" : "opacity-100")}>
          {text}
        </span>
      </div>
    </animated.div>
  );
};
