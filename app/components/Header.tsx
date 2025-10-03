import Link from "next/link";
import { useSnapshot } from "valtio";
import { filterStore, FilterView } from "../store/filterStore";
import { Leva } from "leva";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MailIcon } from "./icons/Mail";
import { bookStore } from "../store/bookStore";
import { BackIcon } from "./icons/Back";
import { ThreeLink } from "./ThreeLink";
import { useMediaQuery } from "usehooks-ts";

export const Header = () => {
  const { view } = useSnapshot(filterStore);
  const { focusedBookId, isRendered } = useSnapshot(bookStore);
  const isGridMode = view === FilterView.Grid;
  const isBookFocused = focusedBookId !== null;
  const [showHeader, setShowHeader] = useState(true);
  const [showBackButton, setShowBackButton] = useState(true);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [levaLoaded, setLevaLoaded] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileBookPageContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRendered) return;
    scrollContainerRef.current = document.getElementById(
      "scroll-el"
    ) as HTMLDivElement;
    mobileBookPageContentRef.current = document.getElementById(
      "mobile-book-page-content"
    ) as HTMLDivElement;

    // TODO: remove this after accelerated launch
    setTimeout(() => {
      setLevaLoaded(true);
    }, 1000);

    // hide header after 100px of scroll from top
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setShowHeader(scrollContainerRef.current.scrollTop <= 300);
      }
      if (mobileBookPageContentRef.current) {
        setShowBackButton(mobileBookPageContentRef.current.scrollTop <= 300);
      }
    };

    scrollContainerRef.current?.addEventListener("scroll", handleScroll);
    mobileBookPageContentRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainerRef.current?.removeEventListener("scroll", handleScroll);
      mobileBookPageContentRef.current?.removeEventListener(
        "scroll",
        handleScroll
      );
      setShowBackButton(true);
      setShowHeader(true);
    };
  }, [isRendered, isMobile, isBookFocused]);

  const handleBackButtonClick = () => {
    bookStore.focusedBookId = null;
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 w-full flex items-center justify-center z-20 font-[500] pointer-events-auto"
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-4 px-4 h-20 w-full">
        <div className="flex-1">
          {/* TODO: Restore after accelerated launch */}
          {/* <div className="hidden lg:flex gap-2 items-center">
            <Link href="/about">About</Link>
            <span>•</span>
            <Link href="/about/#who-we-are">Who We Are</Link>
          </div>
          <div className="lg:hidden flex gap-2 items-center">
            <Link href="/">
              <ShoppingCartIcon />
            </Link>
          </div> */}
          <button
            className={cn(
              "text-black flex items-center gap-2 cursor-pointer transition-all duration-300 delay-0 opacity-0 translate-x-5 pointer-events-none group",
              isBookFocused &&
                showBackButton &&
                "opacity-100 translate-x-0 delay-400 pointer-events-auto"
            )}
            onClick={handleBackButtonClick}
          >
            <span className="relative w-[24px] h-[18px] [svg]:w-full [svg]:h-full group-hover:animate-[arrow-bounce_1s_ease-in-out_infinite]">
              <BackIcon />
            </span>
            <span className="text-[19px] font-medium">
              back to {isGridMode ? "grid" : "stack"}
            </span>
          </button>
        </div>
        {!isBookFocused && (
          <h1
            className={cn(
              "text-4xl flex justify-center whitespace-nowrap items-center text-center font-fields font-[600] flex-1 transition-opacity duration-300",
              !showHeader && "opacity-0 pointer-events-none"
            )}
          >
            <Link href="/">
              <Image
                className="object-contain w-[140px]"
                src="/logo-dog-stacked.png"
                alt="Logo"
                height={6120}
                width={240}
              />
            </Link>
          </h1>
        )}
        <div
          className={cn(
            "gap-2 items-center flex-1 flex justify-end opacity-100 transition-opacity duration-300 delay-0 pointer-events-auto",
            isBookFocused && "opacity-0 delay-600 pointer-events-none"
          )}
        >
          <div className="hidden lg:flex gap-2 items-center text-black">
            <ThreeLink animatedUnderline href="/contact">
              Contact
            </ThreeLink>
          </div>
          <div className="lg:hidden flex gap-2 items-center text-black">
            <ThreeLink noUnderline href="/contact">
              <MailIcon className="w-8 h-8" />
            </ThreeLink>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "hidden lg:block absolute top-0 right-0 opacity-0 hover:opacity-100 transition-opacity duration-300",
          levaLoaded && showHeader
            ? isCollapsed
              ? "opacity-30"
              : "opacity-100"
            : "opacity-0"
        )}
      >
        <Leva
          collapsed={{ collapsed: isCollapsed, onChange: setIsCollapsed }}
          isRoot
        />
      </div>
    </div>
  );
};
