import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BBAnchor, Html, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  BookXS,
  BookSM,
  BookMD,
  BookLG,
  BookXL,
  Book280x260,
} from "./models/books";
import {
  animated,
  config,
  useChain,
  useSpring,
  useSpringRef,
} from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { Book as BookType } from "@/types/app";
import {
  calculateOptimalZDistance,
  calculateSortGridPosition,
  getContentfulBookSize,
  getBookSortYPosition,
  getCurrentBookIndex,
  getDropHeight,
  calculateFocusedBookCenterOffset,
} from "../utils/book";
import { filterStore, FilterView } from "../store/filterStore";
import { subscribeKey } from "valtio/utils";
import { MeshStandardMaterialProperties } from "three";
import { useMediaQuery } from "usehooks-ts";
import { CursorSvg } from "./CursorSvg";
import { globalStore } from "../store/globalStore";

const GRID_DELAY = 50; // delay between books in grid mode
const STACK_DELAY = 10; // delay between books in stack mode

function Book({
  book,
  materialControls,
  gridOverrideControls,
}: {
  book: BookType;
  materialControls: Partial<MeshStandardMaterialProperties>;
  gridOverrideControls?: {
    gridItemWidth: number;
    gridItemHeight: number;
    columnSpacing: number;
    rowSpacing: number;
  };
}) {
  const { camera } = useThree();
  const { books } = useSnapshot(bookStore);
  const { search } = useSnapshot(filterStore);
  const { isSorting } = useSnapshot(filterStore);
  const { view } = useSnapshot(filterStore);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [someBookIsFocused, setSomeBookIsFocused] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isGridMode = view === FilterView.Grid;
  const isSlidingRef = useRef(false);
  const wasFocusedRef = useRef(false);
  const [bookFlipped, setBookFlipped] = useState(false);

  useEffect(() => {
    if (isMobile) {
      const unsubscribeBookFlipped = subscribeKey(
        bookStore,
        "isBookFlipped",
        (isBookFlipped) => {
          setBookFlipped(isBookFlipped);
        }
      );
      return () => {
        unsubscribeBookFlipped();
      };
    }

    const unsubscribeFocusedBookId = subscribeKey(
      bookStore,
      "focusedBookId",
      (focusedBookId) => {
        setIsFocused(focusedBookId === book.id);
        setSomeBookIsFocused(focusedBookId !== null);
      }
    );

    const unsubscribeHoveredBookId = subscribeKey(
      bookStore,
      "hoveredBookId",
      (hoveredBookId) => {
        setIsHovered(hoveredBookId === book.id);
      }
    );

    return () => {
      unsubscribeFocusedBookId();
      unsubscribeHoveredBookId();
    };
  }, [isMobile]);

  useEffect(() => {
    // Remove featured status if any filter is applied (search or sorting)
    if (isSorting || search.length > 1) {
      if (bookStore.books[book.id].featured) {
        bookStore.books[book.id].featured = false;
      }
    }
  }, [book.id, isSorting, search.length]);

  useEffect(() => {
    if (wasFocusedRef.current && isFocused) {
      wasFocusedRef.current = false;
    } else if (!wasFocusedRef.current && isFocused) {
      wasFocusedRef.current = true;
    }
  }, [isFocused]);

  useCursor(isHovered, book.featured || isFocused ? "none" : "pointer", "auto");

  const bookPosition = !isGridMode
    ? getBookSortYPosition(book.id)
    : calculateSortGridPosition(book.id, gridOverrideControls);

  const currentBookIndex = getCurrentBookIndex(book.id);
  const reverseBookIndex = Object.keys(books).length - 1 - currentBookIndex;

  const stackAnimation = useMemo(
    () => ({
      posX:
        book.featured || isFocused
          ? isFocused
            ? book.featured
              ? 0 // Featured books when focused should be perfectly centered
              : calculateFocusedBookCenterOffset(camera, book.bookSize, 0)
            : 0 // No offset for featured books either
          : isSorting
            ? getContentfulBookSize(book.bookSize)[0] *
              2 *
              (currentBookIndex % 2 === 0 ? 1 : -1)
            : search.length > 1
              ? !book.hidden
                ? 0
                : book.offset.posX
              : book.featured
                ? 0 // Remove X offset for featured books
                : book.offset.posX,
      posY: bookPosition.posY,
      posZ: isFocused
        ? 0
        : someBookIsFocused
          ? -0.5 //distance the other books jump back when a book is focused
          : isSorting
            ? -getContentfulBookSize(book.bookSize)[2] * 2
            : search.length > 1
              ? !book.hidden
                ? 0
                : -0.5
              : book.featured
                ? -getContentfulBookSize("MD")[0] / 2 // No offset for featured books
                : -getContentfulBookSize(book.bookSize)[0] / 2 +
                  book.offset.posZ,
      rotX: 0,
      rotY: book.featured ? 0 : book.offset.rotY,
      rotZ: 0,
      onRest: () => {
        // Reset isSorting when animation completes
        if (filterStore.isSorting) {
          filterStore.isSorting = false;
        }
      },
      config: (key: string) => {
        switch (key) {
          case "posY":
            return config.default;
          case "posZ":
            return config.default;
          default:
            return isGridMode ? config.gentle : config.default;
        }
      },
      delay: (_key: string) =>
        isFocused || someBookIsFocused ? 0 : currentBookIndex * STACK_DELAY,
    }),
    [
      book.featured,
      book.bookSize,
      book.hidden,
      isFocused,
      someBookIsFocused,
      isGridMode,
      isSorting,
      camera,
      search.length,
      currentBookIndex,
      book.offset.posZ,
      book.offset.posX,
      book.offset.rotY,
      bookPosition.posY,
    ]
  );

  const gridAnimation = useMemo(
    () => ({
      posX: isFocused ? 0 : bookPosition.posX,
      posY: bookPosition.posY,
      posZ: bookPosition.posZ,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      delay: (key: string) => {
        switch (key) {
          case "posX":
            return isFocused
              ? 0
              : wasFocusedRef.current
                ? 0
                : reverseBookIndex * GRID_DELAY;
          case "posY":
          case "posZ":
          case "rotX":
          case "rotY":
          case "rotZ":
            return reverseBookIndex * GRID_DELAY;
          default:
            return 0;
        }
      },
    }),
    [
      bookPosition.posX,
      bookPosition.posY,
      bookPosition.posZ,
      reverseBookIndex,
      isFocused,
    ]
  );

  const bookSpring = useSpring(isGridMode ? gridAnimation : stackAnimation);

  const bookFocusedSlideRef = useSpringRef();
  const [bookFocusedSlideSpring] = useSpring(
    {
      ref: bookFocusedSlideRef,
      to: isFocused
        ? {
            posZ:
              calculateOptimalZDistance(camera, book.bookSize) -
              bookPosition.posZ,
          }
        : {
            posZ: isSorting
              ? -getContentfulBookSize(book.bookSize)[2] * 2 - 0.001
              : bookPosition.posZ,
          },
      onStart: () => {
        isSlidingRef.current = true;
      },
      onRest: () => {
        isSlidingRef.current = false;
      },
      config: isGridMode ? config.default : config.gentle,
    },
    [isFocused, isGridMode, book.bookSize]
  );

  const dropHeight = getDropHeight(book.id);

  const bookFocusedLiftRef = useSpringRef();
  const [bookFocusedLiftSpring, liftApi] = useSpring(
    {
      ref: bookFocusedLiftRef,
      to: isFocused
        ? {
            posY: camera.position.y - bookSpring.posY.get(),
            rotX: Math.PI / 2,
            rotY: -Math.PI / 2,
          }
        : isGridMode
          ? isFocused
            ? {
                posY: camera.position.y,
                rotX: Math.PI / 2,
                rotY: -Math.PI / 2,
              }
            : {
                posY: 0,
                rotX: Math.PI / 2,
                rotY: -Math.PI / 2,
              }
          : {
              posY: -dropHeight,
              rotX: book.featured ? Math.PI / 2 : 0,
              rotY: book.featured ? -Math.PI / 2 : 0,
            },
      config: config.default,
      delay: (key: string) => {
        switch (key) {
          case "posY":
            return isGridMode
              ? isFocused || wasFocusedRef.current
                ? 0
                : reverseBookIndex * GRID_DELAY
              : 250;
          case "rotX":
          case "rotY":
            return isGridMode && !isFocused
              ? reverseBookIndex * GRID_DELAY
              : !isFocused
                ? 250
                : 0;
          default:
            return isGridMode
              ? reverseBookIndex * GRID_DELAY
              : !isFocused && dropHeight > 0
                ? 250
                : 0;
        }
      },
    },
    [isFocused, dropHeight, isGridMode, book.featured]
  );

  useChain(
    isFocused
      ? [bookFocusedSlideRef, bookFocusedLiftRef]
      : [bookFocusedLiftRef, bookFocusedSlideRef],
    isGridMode ? [0, 0] : isFocused ? [0, 0.3] : [0, 0.5]
  );

  const bookFocusedTiltGroupRef = useSpringRef();
  const [bookFocusedTiltGroupSpring, bookFocusedTiltGroupApi] = useSpring(
    {
      ref: bookFocusedTiltGroupRef,
      to: { rotX: 0, rotZ: 0, posY: 0 },
      config: { mass: 1, tension: 350, friction: 40 },
    },
    [isFocused, isHovered, bookFlipped]
  );

  const handleClick = (e: React.MouseEvent<THREE.Mesh>) => {
    e.stopPropagation();

    if (
      book.hidden ||
      (someBookIsFocused && book.id !== bookStore.focusedBookId)
    )
      return;

    if (isFocused) {
      setBookFlipped(!bookFlipped);
      bookFocusedTiltGroupApi.start({
        rotX:
          bookFocusedTiltGroupSpring.rotX.get() +
          (bookFlipped ? Math.PI : -Math.PI),
        rotZ: -bookFocusedTiltGroupSpring.rotZ.get(),
        posY: bookSpring.posX.get(),
      });
    } else {
      bookStore.focusedBookId = book.id;
    }
  };

  useFrame(() => {
    // tilt the book when focused
    if (isFocused) {
      const targetOffset = camera.position.y - bookSpring.posY.get();
      liftApi.start({
        posY: targetOffset,
        config: config.stiff,
      });
    } else {
      if (isGridMode) {
        bookFocusedTiltGroupApi.start({
          rotX: isHovered && !isFocused ? Math.PI / 12 : 0,
          rotZ: 0,
          config: (key: string) => {
            if (key === "rotX") {
              return config.stiff;
            }
            return config.default;
          },
        });
      } else {
        bookFocusedTiltGroupApi.start({
          rotX: !isMobile ? 0 : bookFlipped ? Math.PI : 0,
          rotZ: 0,
          posY:
            isHovered && !isFocused && !book.featured
              ? 0.01
              : isFocused
                ? bookSpring.posX.get()
                : 0,
        });
      }
    }
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
      if (isFocused) {
        const maxTilt = -0.45;
        const tiltX = normalizedX * maxTilt;
        const tiltY = normalizedY * maxTilt * 0.5;
        bookFocusedTiltGroupApi.start({
          rotX: bookFlipped ? tiltX - Math.PI : tiltX,
          rotZ: bookFlipped ? -tiltY : tiltY,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isFocused, bookFocusedTiltGroupApi, bookFlipped]);

  const [width, thickness, height] = getContentfulBookSize(book.bookSize);

  return (
    <animated.group
      name="book"
      userData={{
        id: book.id,
        width,
        thickness,
        height,
        x: bookSpring.posX,
        y: bookSpring.posY,
        z: bookSpring.posZ,
      }}
      position-x={bookSpring.posX}
      position-y={bookSpring.posY}
      position-z={bookSpring.posZ}
      rotation-x={bookSpring.rotX}
      rotation-y={bookSpring.rotY}
      rotation-z={bookSpring.rotZ}
      onClick={handleClick}
      onPointerEnter={(e) => {
        e.stopPropagation();
        if (!book.hidden) {
          bookStore.hoveredBookId = book.id;
        }
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        if (!book.hidden) {
          bookStore.hoveredBookId = null;
        }
      }}
    >
      <animated.group
        name="book-focused-group"
        position-z={bookFocusedSlideSpring.posZ}
        position-y={bookFocusedLiftSpring.posY}
        rotation-x={bookFocusedLiftSpring.rotX}
        rotation-y={bookFocusedLiftSpring.rotY}
      >
        <animated.group
          name="book-focused-tilt-group"
          position-z={bookFocusedTiltGroupSpring.posY}
          rotation-x={bookFocusedTiltGroupSpring.rotX}
          rotation-z={bookFocusedTiltGroupSpring.rotZ}
        >
          <BookModel book={book} materialControls={materialControls} />
        </animated.group>
      </animated.group>
      {!isGridMode && !someBookIsFocused && !book.hidden && (
        <></>
        // <FeaturedLinks book={book} isHovered={isHovered} />
      )}
    </animated.group>
  );
}

const BookModel = ({
  book,
  materialControls,
}: {
  book: BookType;
  materialControls: Partial<MeshStandardMaterialProperties>;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { currentRoute } = useSnapshot(globalStore);
  const { isBookFlipped } = useSnapshot(bookStore);
  const isBookPage = currentRoute.startsWith("/books/");

  const SelectedBookModel = useMemo(() => {
    switch (book.bookSize) {
      case "XS":
        return BookXS;
      case "SM":
        return BookSM;
      case "MD":
        return BookMD;
      case "LG":
        return BookLG;
      case "XL":
        return BookXL;
      case "280x260":
        return Book280x260;
      default:
        return BookMD;
    }
  }, [book.bookSize]);

  const htmlRef = useRef<HTMLElement>(
    document.getElementById("middle") as HTMLElement
  );
  const scrollRef = useRef<HTMLDivElement>(
    document.getElementById("scroll-el") as HTMLDivElement
  );

  return (
    <Suspense fallback={null}>
      <group name="book-model">
        <SelectedBookModel book={book} materialControls={materialControls} />
        {isMobile && (
          <Html
            portal={htmlRef}
            center
            position={[0.11, 0, -0.11]}
            wrapperClass="pointer-events-none"
            zIndexRange={[100, 100]}
          >
            <div className="w-20 h-20">
              <CursorSvg
                text={isBookPage ? "Flip" : "Focus"}
                mousePosition={{
                  x: 0,
                  y: 0,
                  nx: isBookPage ? (isBookFlipped ? -0.6 : 0.7) : 0.5,
                  ny: isBookPage ? (isBookFlipped ? 0.7 : 0.7) : 0.5,
                }}
                scrollRef={scrollRef}
                focusedBookId={book.id}
              />
            </div>
          </Html>
        )}
      </group>
    </Suspense>
  );
};

export default Book;
