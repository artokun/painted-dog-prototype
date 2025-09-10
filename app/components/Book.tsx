import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BBAnchor,
  Html,
  Text,
  TextProps,
  useCursor,
  useScroll,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BookXS, BookSM, BookMD, BookLG, BookXL } from "./models/books";
import {
  animated,
  config,
  useChain,
  useSpring,
  useSpringRef,
} from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { Book as BookType, BookMap } from "@/types/book";
import {
  calculateOptimalZDistance,
  calculateSortGridPosition,
  getContentfulBookSize,
  getBookSortYPosition,
  getCurrentBookIndex,
  getDropHeight,
} from "../utils/book";
import { filterStore, FilterView } from "../store/filterStore";
import { cn } from "@/lib/utils";
import Link from "next/link";

const getOffsets = () => {
  return {
    posX: Math.random() * 0.012 - 0.006,
    rotY: Math.random() * 0.012 - 0.006,
    posZ: Math.random() * 0.012 - 0.006,
  };
};

const GRID_DELAY = 50; // delay between books in grid mode
const STACK_DELAY = 10; // delay between books in stack mode

function Book(book: BookType) {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const { search } = useSnapshot(filterStore);
  const { sortBy, sortOrder, isSorting } = useSnapshot(filterStore);
  const { camera } = useThree();
  const isFocused = focusedBookId === book.id;
  const isSlidingRef = useRef(false);
  const { view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;

  // Use local state for hover to avoid global state rerenders
  const [isHovered, setIsHovered] = useState(false);
  const someBookIsFocused = focusedBookId !== null;
  const wasFocusedRef = useRef(false);

  useCursor(isHovered, "pointer", "auto");

  useEffect(() => {
    if (wasFocusedRef.current !== Boolean(focusedBookId === book.id)) {
      wasFocusedRef.current = Boolean(focusedBookId === book.id);
    }
  }, [focusedBookId]);

  const bookPosition = useMemo(
    () =>
      !isGridMode
        ? getBookSortYPosition(book.id, books as BookMap, sortBy, sortOrder)
        : calculateSortGridPosition(
            book.id,
            books as BookMap,
            sortBy,
            sortOrder
          ),
    [book.id, books, sortBy, sortOrder, isGridMode]
  );

  const offsets = useMemo(() => getOffsets(), []);
  const currentBookIndex = getCurrentBookIndex(
    book.id,
    books as BookMap,
    sortBy,
    sortOrder
  );

  const reverseBookIndex = Object.keys(books).length - 1 - currentBookIndex;

  const stackAnimation = useMemo(
    () => ({
      posX:
        book.isFeatured || isFocused
          ? 0
          : isSorting
            ? getContentfulBookSize(book.bookSize)[0] *
              2 *
              (currentBookIndex % 2 === 0 ? 1 : -1)
            : search.length > 1
              ? book.hidden
                ? 0
                : offsets.posX
              : offsets.posX,
      posY: bookPosition.posY,
      posZ:
        book.isFeatured || isFocused
          ? 0
          : isSorting
            ? -getContentfulBookSize(book.bookSize)[2] * 2
            : search.length > 1
              ? book.hidden
                ? 0
                : -0.5
              : offsets.posZ,
      rotX: 0,
      rotY: book.isFeatured ? 0 : offsets.rotY,
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
      delay: (_key: string) => (isFocused ? 0 : currentBookIndex * STACK_DELAY),
    }),
    [
      book.isFeatured,
      isFocused,
      isGridMode,
      isSorting,
      search.length,
      currentBookIndex,
      offsets,
      bookPosition,
      reverseBookIndex,
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
            // posZ: calculateOptimalZDistance(camera),
            posZ: calculateOptimalZDistance(camera) - bookPosition.posZ,
          }
        : {
            posZ: isSorting
              ? -getContentfulBookSize(book.bookSize)[2] - 0.001
              : 0,
          },
      onStart: () => {
        isSlidingRef.current = true;
      },
      onRest: () => {
        isSlidingRef.current = false;
      },
      config: isGridMode ? config.default : config.gentle,
    },
    [isFocused, isGridMode]
  );

  const dropHeight = useMemo(
    () =>
      getDropHeight(
        book.id,
        focusedBookId,
        books as BookMap,
        sortBy,
        sortOrder
      ),
    [book.id, focusedBookId, books, sortBy, sortOrder]
  );

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
              rotX: book.isFeatured ? Math.PI / 2 : 0,
              rotY: book.isFeatured ? -Math.PI / 2 : 0,
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
    [isFocused, dropHeight, isGridMode]
  );

  useChain(
    isFocused
      ? [bookFocusedSlideRef, bookFocusedLiftRef]
      : [bookFocusedLiftRef, bookFocusedSlideRef],
    isGridMode ? [0, 0] : isFocused ? [0, 0.3] : [0, 0.5]
  );

  const handleClick = (e: React.MouseEvent<THREE.Mesh>) => {
    e.stopPropagation();

    if (isFocused) {
      bookStore.focusedBookId = null;
    } else {
      bookStore.focusedBookId = book.id;
    }
  };

  const bookFocusedTiltGroupRef = useSpringRef();
  const [bookFocusedTiltGroupSpring, bookFocusedTiltGroupApi] = useSpring(
    {
      ref: bookFocusedTiltGroupRef,
      to: { rotX: 0, rotZ: 0, posY: 0 },
      config: { mass: 1, tension: 350, friction: 40 },
    },
    [isFocused, isHovered]
  );

  useFrame(({ pointer }) => {
    // tilt the book when focused
    if (isFocused && !isSlidingRef.current) {
      const targetOffset = camera.position.y - bookSpring.posY.get();
      liftApi.start({
        posY: targetOffset,
        config: config.stiff,
      });
      const maxTilt = 0.15;
      const tiltX = pointer.x * maxTilt;
      const tiltY = pointer.y * maxTilt;
      bookFocusedTiltGroupApi.start({
        rotX: -tiltX,
        rotZ: tiltY,
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
          rotX: 0,
          rotZ: 0,
          posY: isHovered && !isFocused && !book.isFeatured ? 0.01 : 0,
        });
      }
    }
  });

  const [width, thickness, height] = getContentfulBookSize(book.bookSize);
  const scroll = useScroll();

  const middleDivRef = useRef<HTMLDivElement>(
    document.getElementById("middle") as HTMLDivElement
  );

  const textVisible =
    isHovered && !someBookIsFocused && !isGridMode && !isSorting;

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
        setIsHovered(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setIsHovered(false);
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
          <BookModel book={book} />
        </animated.group>
      </animated.group>
      {!someBookIsFocused && (
        <Html
          zIndexRange={[-0.1, 0]}
          center
          className={cn(
            "text-sm opacity-0 w-dvw px-12 pointer-events-none",
            textVisible && "opacity-100"
          )}
          style={{
            height:
              getContentfulBookSize(book.bookSize)[book.isFeatured ? 2 : 1] *
              3400,
            transition: "opacity ease-in-out",
            transitionDuration: isHovered ? "0ms" : "0.3s",
          }}
          position={[
            -offsets.posX,
            0,
            getContentfulBookSize(book.bookSize)[0] * 0.5 - offsets.posZ,
          ]}
          portal={middleDivRef}
        >
          <div
            className="text-black flex justify-between h-full w-full"
            onWheel={(e) => {
              e.preventDefault();
              scroll.el.scrollTop += e.deltaY;
            }}
          >
            {book.linkToFeaturedArticle && (
              <div
                className="h-full flex items-center justify-start pointer-events-auto w-[28dvw]"
                onPointerOver={(e) => {
                  e.preventDefault();
                  setIsHovered(true);
                }}
                onPointerLeave={(e) => {
                  e.preventDefault();
                  setIsHovered(false);
                }}
              >
                <Link
                  href={book.linkToFeaturedArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {book.linkToFeaturedArticle.text}
                </Link>
              </div>
            )}
            {book.linkToPodcastEpisode && (
              <Link
                href={book.linkToPodcastEpisode.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ellipsis hover:underline flex justify-end items-center h-full pointer-events-auto w-[28dvw] text-right"
                onPointerOver={(e) => {
                  setIsHovered(true);
                }}
                onPointerLeave={(e) => {
                  setIsHovered(false);
                }}
              >
                {book.linkToPodcastEpisode.text}
              </Link>
            )}
          </div>
        </Html>
      )}
    </animated.group>
  );
}

const BookModel = ({ book }: { book: BookType }) => {
  switch (book.bookSize) {
    case "XS":
      return <BookXS castShadow receiveShadow textures={book.textures} />;
    case "SM":
      return <BookSM castShadow receiveShadow textures={book.textures} />;
    case "MD":
      return <BookMD castShadow receiveShadow textures={book.textures} />;
    case "LG":
      return <BookLG castShadow receiveShadow textures={book.textures} />;
    case "XL":
      return <BookXL castShadow receiveShadow textures={book.textures} />;
    default:
      return <BookMD castShadow receiveShadow textures={book.textures} />; // Default fallback
  }
};

export default Book;
