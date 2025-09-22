"use client";

import { animated, useSpring, config, useTrail } from "@react-spring/web";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Book, BookMap, ContentfulBook } from "@/types/app";
import { BookState, bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { filterStore, FilterView } from "../store/filterStore";

const menuItems = [
  "Authors",
  "Critical Reception",
  "Podcast Episode",
  "Excerpt",
  "Product Information",
];

export default function BookPageContent() {
  const { focusedBookId } = useSnapshot(bookStore);
  const { view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;
  const [book, setBook] = useState<ContentfulBook | null>(null);
  const ENTRY = 300;
  const EXIT = 0;

  useEffect(() => {
    const newBook = focusedBookId ? bookStore.books[focusedBookId] : null;
    if (newBook) {
      setBook(newBook);
    } else {
      setTimeout(() => {
        setBook(null);
      }, ENTRY);
    }
  }, [focusedBookId]);

  const handleBackButtonClick = () => {
    bookStore.focusedBookId = null;
  };

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
    delay: focusedBookId ? ENTRY : EXIT,
  });

  const leftContentSpring = useSpring({
    opacity: focusedBookId ? 1 : 0,
    x: focusedBookId ? "0%" : "-100%",
    delay: focusedBookId ? ENTRY : EXIT,
  });

  const bottomContentSpring = useSpring({
    opacity: focusedBookId ? 1 : 0,
    y: focusedBookId ? "0%" : "100%",
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
        <ul className="flex flex-col gap-2 w-full font-medium [&>li]:pt-2">
          {menuTrail.map((style, index) => (
            <animated.li
              key={menuItems[index]}
              style={style}
              className="flex group gap-2 border-b border-black w-full justify-between items-center pointer-events-auto cursor-pointer"
            >
              <span className="group-hover:translate-x-2 transition-all duration-300 group-active:text-gray-500">
                {index === 0
                  ? book?.authors.map((author) => author.fullName).join(", ")
                  : menuItems[index]}
              </span>
              <span className="opacity-0 group-hover:rotate-90 group-hover:opacity-100 transition-all duration-300 group-active:text-gray-500">
                <PlusIcon size={20} />
              </span>
            </animated.li>
          ))}
        </ul>
      </animated.section>

      {/* Middle empty div */}
      <section />

      {/* Right Content */}
      <animated.section
        style={rightContentSpring}
        className="flex flex-col gap-4 justify-center pointer-events-auto h-full px-20 py-4"
      >
        <h2 className="text-2xl font-medium">{book?.title}</h2>
        {book?.isbn && (
          <p className="text-sm text-gray-800 -mt-3">
            ISBN-13&nbsp;: {book.isbn}
          </p>
        )}
        <p className="whitespace-pre-wrap overflow-y-auto">
          {book?.description}
        </p>
      </animated.section>
      {/* Bottom Content */}
      <animated.div
        style={bottomContentSpring}
        className="absolute bottom-10 left-0 h-10 flex align-center justify-center pointer-events-auto w-full px-20"
      >
        <button
          className="bg-white border-right border-black text-black pl-3 pr-5 font-medium flex items-center gap-2 cursor-pointer hover:bg-black hover:text-white transition-all duration-300"
          onClick={handleBackButtonClick}
        >
          <span>
            <ArrowLeftIcon size={20} />
          </span>
          <span>Back to {isGridMode ? "Grid" : "Stack"}</span>
        </button>
      </animated.div>
    </div>
  );
}
