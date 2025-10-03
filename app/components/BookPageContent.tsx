"use client";

import {
  animated,
  useSpring,
  config,
  useTrail,
  useScroll,
} from "@react-spring/web";
import { useState, useEffect, useMemo, useRef, RefObject } from "react";
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
  const isMobile = useMediaQuery("(max-width: 1024px)");
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
        "absolute inset-0 top-0 left-0 h-screen w-full z-20 gap-4 pointer-events-none lg:pt-20",
        "flex flex-col-reverse lg:grid lg:grid-cols-3 lg:grid-rows-1 lg:place-items-center text-black"
      )}
    >
      {/* Left Menu */}
      <animated.section
        style={leftContentSpring}
        className="flex flex-col gap-4 p-10 xl:p-20 justify-center h-full w-full pb-[120px] lg:pb-10 xl:lg:pb-20"
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
          <PDButton href="/contact" className="w-full" primary tall>
            <ShoppingCartIcon className="w-5 h-5 -mt-0.5" /> Buy for R760
          </PDButton>
          <PDButton href="/contact" className="flex-1" tall>
            Takealot
          </PDButton>
          <PDButton className="flex-1" href="/contact" tall>
            Exclusive Books
          </PDButton>
        </div>
      </animated.section>

      {/* Middle empty div */}
      <section />

      {/* Right Content */}
      <animated.section
        style={rightContentSpring}
        className="relative pointer-events-auto w-full h-full mt-[75dvh] lg:mt-0 lg:pt-0"
      >
        <div
          className="relative lg:h-full flex flex-col lg:block"
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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Peek animation - double bounce upward
  const [peekSpring, peekApi] = useSpring(() => ({
    y: 0,
    config: config.default,
  }));

  // Reset interaction flag when component mounts
  useEffect(() => {
    setHasInteracted(false);
  }, []);

  // Handle user interaction - cancel peek and mark as interacted
  useEffect(() => {
    const handleInteraction = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setHasInteracted(true);
      peekApi.start({ y: 0, immediate: true });
    };

    const contentElement = contentRef.current;
    if (!contentElement) return;

    contentElement.addEventListener("scroll", handleInteraction, {
      passive: true,
    });
    contentElement.addEventListener("touchstart", handleInteraction, {
      passive: true,
    });
    contentElement.addEventListener("touchmove", handleInteraction, {
      passive: true,
    });

    return () => {
      contentElement.removeEventListener("scroll", handleInteraction);
      contentElement.removeEventListener("touchstart", handleInteraction);
      contentElement.removeEventListener("touchmove", handleInteraction);
    };
  }, [peekApi]);

  // Trigger peek animation after 2s of inactivity (only once per session)
  useEffect(() => {
    if (hasInteracted) return;

    timeoutRef.current = setTimeout(() => {
      // Double peek animation
      peekApi.start({
        from: { y: 0 },
        to: async (next) => {
          await next({ y: -10 });
          await next({ y: 0 });
          await next({ y: -10 });
          await next({ y: 0 });
        },
      });
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasInteracted, peekApi]);

  return (
    <animated.div
      id="mobile-book-page-content"
      ref={contentRef}
      style={peekSpring}
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
      <div className="w-full backdrop-blur-sm pt-5 bg-[#e1d6bf77] border-t border-black">
        {/* Leaflets stacked above content */}
        <section className="relative z-10 w-full">
          <div className="relative lg:h-full flex flex-col">
            <Leaflet
              key={menuItems[0]}
              index={0}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              isMobile={true}
            />
            {/* Buy buttons after Leaflets */}
            <div className="relative z-10 flex flex-col gap-3 mb-15 px-5">
              <PDButton href="/contact" className="w-full" primary tall>
                <ShoppingCartIcon className="w-5 h-5 -mt-0.5" /> Buy for R760
              </PDButton>
              <div className="flex gap-3">
                <PDButton href="/contact" className="flex-1" tall>
                  Takealot
                </PDButton>
                <PDButton className="flex-1" href="/contact" tall>
                  Exclusive Books
                </PDButton>
              </div>
            </div>

            {menuItems
              .slice(1, -1)
              .filter((item) => item !== "Podcast Episodes")
              .map((item, index) => (
                <Leaflet
                  key={item}
                  index={index + 1}
                  selectedIndex={selectedIndex + 1}
                  setSelectedIndex={setSelectedIndex}
                  isMobile={true}
                />
              ))}
          </div>
        </section>
        <Footer />
      </div>
    </animated.div>
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
    // opacity: selectedIndex === index ? 1 : selectedIndex > index ? 0.5 : 0,
    opacity: 1,
  });

  const mobileStyle = useSpring({
    opacity: 1,
  });

  const content = useMemo(() => {
    switch (index) {
      case 0:
        return isMobile ? (
          <FullDescriptionSection />
        ) : (
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
  }, [index]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef as RefObject<HTMLElement>,
  });

  return (
    <animated.div
      style={isMobile ? mobileStyle : style}
      className={cn(
        "relative lg:absolute lg:inset-0 h-auto min-h-[75dvh] lg:h-full w-full xl:pl-20 pr-5 pl-5 lg:pl-0 transform-style-preserve-3d origin-right pb-5 pointer-events-none",
        index === selectedIndex && "pointer-events-auto",
        isMobile && "min-h-0"
      )}
    >
      <div
        className={cn(
          "relative w-full h-full p-1",
          index > 0 && "bg-[#F9F6F0]"
        )}
      >
        <div
          ref={scrollContainerRef}
          className={cn(
            "px-9 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent",
            index > 0 && "pt-40 border border-black pb-20",
            isMobile && "pb-10 pt-10",
            isMobile && index === 0 && "px-0"
          )}
        >
          <div className="min-h-full flex flex-col justify-center">
            {content}
          </div>
        </div>
        {index > 0 && !isMobile && (
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
        {index > 0 && !isMobile && (
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
