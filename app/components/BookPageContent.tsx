"use client";

import {
  animated,
  useSpring,
  config,
  useTrail,
  useScroll,
} from "@react-spring/web";
import { useState, useEffect, useMemo, useRef, RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ContentfulBook } from "@/types/app";
import { bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";
import { PDButton } from "./ui/PDButton";
import { ShoppingCartIcon } from "./icons/ShoppingCart";
import { CloseIcon } from "./icons/Close";
import { ArrowDownIcon } from "./icons/ArrowDown";
import { BookSection } from "./leaflets/BookSection";
import { AuthorsSection } from "./leaflets/AuthorsSection";
import { ReviewsSection } from "./leaflets/ReviewsSection";
import { PodcastEpisodesSection } from "./leaflets/PodcastEpisodesSection";
import { ExcerptsSection } from "./leaflets/ExcerptsSection";
import { ProductInformationSection } from "./leaflets/ProductInformationSection";
import { FullDescriptionSection } from "./leaflets/FullDescription";
import { MenuList } from "./MenuList";
import { Footer } from "./Footer";
import { useMediaQuery } from "usehooks-ts";
import { globalStore } from "../store/globalStore";

const menuItems = [
  "book",
  "authors",
  "Reviews",
  "Podcast Episodes",
  "Excerpt",
  "Product Information",
  "Full Description",
] as const;

const ENTRY = 300;
const EXIT = 0;

// Format author names with proper comma and ampersand usage
function formatAuthorNames(authors: { fullName: string }[]): string {
  if (!authors || authors.length === 0) return "";
  if (authors.length === 1) return authors[0].fullName;
  if (authors.length === 2) {
    return `${authors[0].fullName} & ${authors[1].fullName}`;
  }
  // More than 2 authors: use commas and ampersand before the last one
  const allButLast = authors
    .slice(0, -1)
    .map((a) => a.fullName)
    .join(", ");
  const last = authors[authors.length - 1].fullName;
  return `${allButLast} & ${last}`;
}

export default function BookPageContent() {
  const { focusedBookId } = useSnapshot(bookStore);
  const { currentRoute } = useSnapshot(globalStore);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [book, setBook] = useState<ContentfulBook | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isBookPage = currentRoute.startsWith("/books/");

  useEffect(() => {
    if (!focusedBookId) {
      setSelectedIndex(0);
    }

    const newBook = focusedBookId ? bookStore.books[focusedBookId] : null;
    if (newBook) {
      setBook(newBook);
    } else {
      setTimeout(() => {
        setBook(null);
      }, ENTRY);
    }

    // ESC handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        bookStore.focusedBookId = null;
      }
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [focusedBookId]);

  // Left menu trail animation - each item slides in with stagger
  const menuTrail = useTrail(menuItems.length, {
    opacity: focusedBookId ? 1 : 0,
    y: focusedBookId ? "0px" : "20px",
    delay: focusedBookId ? ENTRY + 100 : EXIT + 100,
    config: config.stiff,
  });

  // Right content animation - slides in from right, exits to right
  const rightContentSpring = useSpring({
    opacity: focusedBookId ? 1 : 0,
    x: focusedBookId ? "0%" : "100%",
    immediate: isMobile && !focusedBookId,
    delay: focusedBookId ? ENTRY : EXIT,
  });

  const leftContentSpring = useSpring({
    opacity: focusedBookId ? 1 : 0,
    x: focusedBookId ? "0%" : "-100%",
    immediate: isMobile && !focusedBookId,
    delay: focusedBookId ? ENTRY : EXIT,
  });

  if (isMobile && focusedBookId && isBookPage) {
    return <MobileBookPageContent />;
  }

  return (
    <div
      id="book-page-content"
      className={cn(
        "absolute inset-0 top-0 left-0 h-screen w-full z-20 gap-4 pointer-events-none md:pt-20",
        "flex flex-col-reverse md:grid md:grid-cols-3 md:grid-rows-1 md:place-items-center text-black"
      )}
    >
      {/* Left Menu */}
      <animated.section
        style={leftContentSpring}
        className="flex flex-col gap-4 p-10 xl:p-20 justify-center h-full w-full pb-[120px] md:pb-10 xl:md:pb-20"
      >
        <MenuList
          menuItems={menuItems}
          menuTrail={menuTrail}
          selectedIndex={selectedIndex}
          onItemClick={setSelectedIndex}
          formatAuthorNames={formatAuthorNames}
          book={book}
        />
        <div className="flex flex-wrap flex-col xl:flex-row gap-3 mt-10 pointer-events-auto">
          <PDButton
            href="https://flyleaf.co.za/product/bitterkomix-sketchbooks-journals/"
            className="w-full"
            target="_blank"
            primary
            tall
          >
            <ShoppingCartIcon className="w-5 h-5 -mt-0.5" /> Buy for R760
          </PDButton>
          <PDButton
            href="https://www.wordsworth.co.za/products/bitterkomix-sketchbooks-journals"
            tall
            className="w-full"
            target="_blank"
          >
            Wordsworth Books
          </PDButton>
        </div>
      </animated.section>

      {/* Middle empty div */}
      <section />

      {/* Right Content */}
      <animated.section
        style={rightContentSpring}
        className="relative pointer-events-auto w-full h-full mt-[75dvh] md:mt-0 md:pt-0"
      >
        <div
          className="relative md:h-full flex flex-col md:block"
          style={{ perspective: "1000px" }}
        >
          {menuItems.map((item, index) => (
            <Leaflet
              key={item}
              index={index}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />
          ))}
        </div>
      </animated.section>
    </div>
  );
}

function MobileBookPageContent() {
  const { focusedBookId } = useSnapshot(bookStore);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [book, setBook] = useState<ContentfulBook | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!focusedBookId) {
      setSelectedIndex(0);
    }

    const newBook = focusedBookId ? bookStore.books[focusedBookId] : null;
    if (newBook) {
      setBook(newBook);
    } else {
      setTimeout(() => {
        setBook(null);
      }, ENTRY);
    }
  }, [focusedBookId]);

  useEffect(() => {
    // Get the portal root element after component mounts
    const root = document.getElementById("portal-root");
    setPortalRoot(root);
  }, []);

  // Left menu trail animation - each item slides in with stagger
  const menuTrail = useTrail(menuItems.length, {});

  return (
    <div
      id="mobile-book-page-content"
      ref={contentRef}
      className={cn(
        "absolute inset-0 top-0 left-0 z-10 w-full h-full overflow-y-auto overflow-x-hidden pointer-events-auto",
        "pb-0 text-black"
      )}
    >
      <button
        className="appearance-none h-[75dvh] w-full bg-transparent pointer-events-auto"
        onClick={() => {
          bookStore.isBookFlipped = !bookStore.isBookFlipped;
        }}
      ></button>
      <div className="w-full pt-5 bg-[#F0D6B2]  shadow-2xl border-t border-[#00000011] shadow-[#000000]">
        {/* Leaflets stacked above content */}
        <section className="relative z-10 w-full">
          <div className="relative md:h-full flex flex-col">
            <div className="px-5">
              <FullDescriptionSection />
            </div>
            {/* Buy buttons after Leaflets */}
            <div className="relative z-10 flex flex-col gap-3 mb-15 px-5">
              <PDButton
                href="https://flyleaf.co.za/product/bitterkomix-sketchbooks-journals/"
                className="w-full"
                target="_blank"
                primary
                tall
              >
                <ShoppingCartIcon className="w-5 h-5 -mt-0.5" /> Buy for R760
              </PDButton>
              <div className="flex gap-3">
                <PDButton
                  href="https://www.wordsworth.co.za/products/bitterkomix-sketchbooks-journals"
                  className="w-full"
                  tall
                  target="_blank"
                >
                  Wordsworth Books
                </PDButton>
              </div>
            </div>
            <div className="px-5 pb-15 pointer-events-auto">
              <MenuList
                menuItems={menuItems}
                menuTrail={menuTrail}
                selectedIndex={selectedIndex}
                onItemClick={setSelectedIndex}
                formatAuthorNames={formatAuthorNames}
                book={book}
              />
            </div>
          </div>
        </section>
        <Footer />
      </div>
      {portalRoot &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 pointer-events-none perspective-[1000px] z-30"
            )}
          >
            {menuItems
              // .slice(1, -1)
              // .filter((item) => item !== "Podcast Episodes")
              .map((item, index) => (
                <Leaflet
                  key={item}
                  index={index}
                  selectedIndex={selectedIndex}
                  setSelectedIndex={setSelectedIndex}
                  isMobile={true}
                />
              ))}
          </div>,
          portalRoot
        )}
    </div>
  );
}

const Leaflet = ({
  index,
  selectedIndex,
  setSelectedIndex,
  isMobile = false,
}: {
  index: number;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  isMobile?: boolean;
}) => {
  const pageArc = 90;
  const arc = typeof index === "number" ? index * pageArc : 0;
  const degrees = arc - (selectedIndex ? selectedIndex * pageArc : 0);

  const style = useSpring({
    rotateY: `${Math.min(Math.max(degrees, 0), 180)}deg`,
    opacity: 1,
  });

  const content = useMemo(() => {
    switch (index) {
      case 0:
        return isMobile ? null : (
          <BookSection setSelectedIndex={setSelectedIndex} />
        );
      case 1:
        return <AuthorsSection />;
      case 2:
        return <ReviewsSection />;
      case 3:
        return <PodcastEpisodesSection />;
      case 4:
        return <ExcerptsSection />;
      case 5:
        return <ProductInformationSection />;
      case 6:
        return <FullDescriptionSection />;
      default:
        return null;
    }
  }, [index, isMobile]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef as RefObject<HTMLElement>,
  });

  return (
    <animated.div
      style={style}
      className={cn(
        "absolute inset-0 min-h-[75dvh] h-full w-full xl:pl-20 pr-5 pl-5 md:pl-0 transform-style-preserve-3d origin-right pb-5 pointer-events-none text-black",
        isMobile &&
          index > 0 &&
          index === selectedIndex &&
          "pointer-events-auto",
        !isMobile && index === selectedIndex && "pointer-events-auto",
        isMobile && "pl-0 pr-0 pb-0"
      )}
    >
      <div
        className={cn(
          "relative w-full h-full p-1",
          index === 0 && isMobile && "h-max",
          index > 0 && "bg-[#F9F6F0]"
        )}
      >
        <div
          ref={scrollContainerRef}
          className={cn(
            "px-9 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent",
            index > 0 && "pt-40 border border-black pb-20",
            isMobile && "pb-20 pt-20"
          )}
        >
          <div className="min-h-full flex flex-col justify-center">
            {content}
          </div>
        </div>
        {index > 0 && (
          <>
            <div className="pointer-events-none absolute top-[5px] left-[5px] right-5 h-30 bg-linear-to-b from-[#F9F6F0] to-transparent" />
            <div className="pointer-events-none absolute bottom-[53px] left-[5px] right-5 h-12 bg-linear-to-t from-[#F9F6F0] to-transparent" />
            <button
              onClick={() =>
                scrollContainerRef.current?.scrollTo({
                  top: scrollContainerRef.current.scrollHeight,
                  behavior: "smooth",
                })
              }
              className="absolute cursor-pointer bottom-[5px] left-[5px] right-[5px] h-12 flex items-center justify-center bg-[#F9F6F0]"
            >
              <animated.span
                style={{ opacity: scrollYProgress.to([0.9, 1], [1, 0]) }}
              >
                <ArrowDownIcon className="w-5 h-5 -mt-2" />
              </animated.span>
            </button>
          </>
        )}
        {index > 0 && (
          <button
            className="absolute top-0 -right-2 px-7 py-5 cursor-pointer"
            onClick={() => setSelectedIndex(0)}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </animated.div>
  );
};
