"use client";

import {
  animated,
  useSpring,
  config,
  useTrail,
  useScroll,
} from "@react-spring/web";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  RefObject,
} from "react";
import { cn } from "@/lib/utils";
import { ContentfulBook } from "@/types/app";
import { bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";
import { PDButton } from "./ui/PDButton";
import { PlusIcon } from "./icons/Plus";
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

export default function BookPageContent() {
  const { focusedBookId } = useSnapshot(bookStore);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [book, setBook] = useState<ContentfulBook | null>(null);

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

  const handleMenuItemClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      const index = parseInt(e.currentTarget.dataset.index || "0");
      setSelectedIndex(selectedIndex === index ? 0 : index);
    },
    [selectedIndex]
  );

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
    perspective: 1000,
    x: focusedBookId ? "0%" : "100%",
    delay: focusedBookId ? ENTRY : EXIT,
  });

  const leftContentSpring = useSpring({
    opacity: focusedBookId ? 1 : 0,
    x: focusedBookId ? "0%" : "-100%",
    delay: focusedBookId ? ENTRY : EXIT,
  });

  return (
    <div
      id="book-page-content"
      className={cn(
        "absolute inset-0 top-0 left-0 h-full w-full z-10 pointer-events-none gap-4 pt-20",
        "grid grid-cols-3 grid-rows-1 place-items-center [&>section]:h-full [&>section]:w-full text-black"
      )}
    >
      {/* Left Menu */}
      <animated.section
        style={leftContentSpring}
        className="flex flex-col gap-4 p-20 justify-center"
      >
        <ul className="flex flex-col gap-3 w-full font-medium [&>li]:pt-2">
          {menuTrail.map(
            (style, index) =>
              index > 0 &&
              index < menuItems.length - 1 &&
              index !== 3 && ( // Podcast Episodes temporarily hidden
                <animated.li
                  key={menuItems[index]}
                  style={style}
                  data-index={index}
                  className={
                    "flex group gap-2 border-b border-current w-full justify-between items-center pointer-events-auto cursor-pointer pr-2"
                  }
                  onClick={handleMenuItemClick}
                >
                  <span
                    className={cn(
                      "group-hover:translate-x-2 transition-all duration-300",
                      selectedIndex === index &&
                        "group-hover:translate-x-4 translate-x-4 "
                    )}
                  >
                    {index === 1
                      ? book?.authors
                          .map((author) => author.fullName)
                          .join(", ")
                      : menuItems[index]}
                  </span>
                  <span
                    className={cn(
                      "opacity-0 group-hover:rotate-90 group-hover:opacity-100 transition-all duration-300",
                      selectedIndex === index &&
                        "opacity-100 rotate-135 group-hover:rotate-135 "
                    )}
                  >
                    <PlusIcon className="w-2.5 h-2.5" />
                  </span>
                </animated.li>
              )
          )}
        </ul>
        <div className="flex flex-wrap gap-3 mt-10 pointer-events-auto">
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
        className="relative pointer-events-auto h-full w-full"
      >
        {menuItems.map((item, index) => (
          <Leaflet
            key={item}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
        ))}
      </animated.section>
    </div>
  );
}

const Leaflet = ({
  index,
  selectedIndex,
  setSelectedIndex,
}: {
  index: number;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}) => {
  const pageArc = 90 / menuItems.length;
  const degrees = typeof index === "number" ? index * pageArc : 0;
  const style = useSpring({
    rotateY: `${degrees - (selectedIndex ? selectedIndex * pageArc : 0)}deg`,
    opacity: selectedIndex === index ? 1 : selectedIndex > index ? 0.5 : 0,
  });

  const content = useMemo(() => {
    switch (index) {
      case 0:
        return <BookSection setSelectedIndex={setSelectedIndex} />;
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
      style={style}
      className={cn(
        "absolute inset-0 h-full w-full pl-20 pr-5 transform-style-preserve-3d origin-right pb-20 pointer-events-none",
        index === selectedIndex && "pointer-events-auto"
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
            index > 0 && "pt-40 border border-black pb-20"
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
      </div>
      {index > 0 && (
        <button
          className="absolute top-0 right-2 z-10 px-7 py-5 cursor-pointer"
          onClick={() => setSelectedIndex(0)}
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      )}
    </animated.div>
  );
};
