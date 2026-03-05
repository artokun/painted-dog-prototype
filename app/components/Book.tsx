import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BBAnchor, Html, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import debounce from "lodash.debounce";
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
const HOME_FEATURED_Y_OFFSET_PX = 28; // subtle lift so hero book sits a touch higher
const HOME_FEATURED_START_SCALE = 1.18;
const FOCUSED_BOOK_CENTER_FACTOR = 0.38;

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
  const {
    currentRoute,
    landingTransitionProgress,
    featuredBookAnchorNdcY,
    overlayScrollPosition,
  } = useSnapshot(globalStore);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [someBookIsFocused, setSomeBookIsFocused] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isGridMode = view === FilterView.Grid;
  const featuredInsertProgress =
    currentRoute === "/" ? landingTransitionProgress : 1;
  const isSlidingRef = useRef(false);
  const wasFocusedRef = useRef(false);
  const [bookFlipped, setBookFlipped] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [featuredAnchorNdcY, setFeaturedAnchorNdcY] = useState(0);

  const measureFeaturedAnchor = useCallback(() => {
    if (
      typeof window === "undefined" ||
      currentRoute !== "/" ||
      !book.featured ||
      isFocused
    ) {
      return;
    }

    const titleEl = document.getElementById("home-title-logo");
    const copyStartEl = document.getElementById("home-copy-start");
    if (!titleEl || !copyStartEl) return;

    const viewportHeight = window.innerHeight;
    const titleRect = titleEl.getBoundingClientRect();
    const copyRect = copyStartEl.getBoundingClientRect();
    const clampedTitleBottom = Math.min(
      Math.max(titleRect.bottom, 0),
      viewportHeight
    );
    const clampedCopyTop = Math.min(Math.max(copyRect.top, 0), viewportHeight);
    const midpointY =
      (clampedTitleBottom + clampedCopyTop) / 2 - HOME_FEATURED_Y_OFFSET_PX;
    const ndcY = Math.min(Math.max(1 - (midpointY / viewportHeight) * 2, -1), 1);

    setFeaturedAnchorNdcY((prev) => (Math.abs(prev - ndcY) > 0.0005 ? ndcY : prev));
  }, [book.featured, currentRoute, isFocused]);

  useEffect(() => {
    if (currentRoute !== "/" || !book.featured || isFocused) {
      setFeaturedAnchorNdcY(0);
      return;
    }

    let rafId = window.requestAnimationFrame(measureFeaturedAnchor);
    const handleResize = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(measureFeaturedAnchor);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    book.featured,
    currentRoute,
    isFocused,
    overlayScrollPosition,
    landingTransitionProgress,
    measureFeaturedAnchor,
  ]);

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
  const focusedBookYOffset =
    getContentfulBookSize(book.bookSize)[2] * FOCUSED_BOOK_CENTER_FACTOR;

  const stackAnimation = useMemo(
    () => {
      const targetFeaturedAnchorNdcY =
        currentRoute === "/" && book.featured
          ? featuredAnchorNdcY
          : featuredBookAnchorNdcY;
      const [featuredWidth] = getContentfulBookSize(book.bookSize);
      const featuredStackPosZ = -featuredWidth / 2;
      const featuredHeroStartPosZ = featuredStackPosZ - featuredWidth * 0.35;
      const featuredPosZ = THREE.MathUtils.lerp(
        featuredHeroStartPosZ,
        featuredStackPosZ,
        featuredInsertProgress
      );
      const featuredHeroPosY = (() => {
        // Solve world-Y from desired screen-space Y (NDC) at the current featured Z.
        // With yaw-only camera motion this is stable and viewport-independent.
        const ndcAtY0 = new THREE.Vector3(0, 0, featuredPosZ).project(camera).y;
        const ndcAtY1 = new THREE.Vector3(0, 1, featuredPosZ).project(camera).y;
        const ndcDelta = ndcAtY1 - ndcAtY0;
        if (Math.abs(ndcDelta) < 0.00001) return 0;
        return (targetFeaturedAnchorNdcY - ndcAtY0) / ndcDelta;
      })();

      return {
      // Keeps featured book insertion aligned with title/header collapse timing.
      // 0 => lifted hero position, 1 => seated in stack.
      posY:
        book.featured && !isFocused
          ? THREE.MathUtils.lerp(featuredHeroPosY, bookPosition.posY, featuredInsertProgress)
          : bookPosition.posY,
      scale:
        book.featured && !isFocused && currentRoute === "/"
          ? THREE.MathUtils.lerp(HOME_FEATURED_START_SCALE, 1, featuredInsertProgress)
          : 1,
      posX:
        book.featured || isFocused
          ? isFocused
            ? calculateFocusedBookCenterOffset(camera, book.bookSize, 0)
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
                ? featuredPosZ
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
      };
    },
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
      featuredInsertProgress,
      featuredAnchorNdcY,
      featuredBookAnchorNdcY,
      currentRoute,
      book.offset.posZ,
      book.offset.posX,
      book.offset.rotY,
      bookPosition.posY,
      windowSize,
    ]
  );

  const gridAnimation = useMemo(
    () => ({
      posX: isFocused ? 0 : bookPosition.posX,
      posY: bookPosition.posY,
      posZ: bookPosition.posZ,
      scale: 1,
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
    [isFocused, isGridMode, book.bookSize, windowSize, isMobile]
  );

  const dropHeight = getDropHeight(book.id);

  const bookFocusedLiftRef = useSpringRef();
  const [bookFocusedLiftSpring, liftApi] = useSpring(
    {
      ref: bookFocusedLiftRef,
      to: isFocused
        ? {
            posY: camera.position.y - bookSpring.posY.get() + focusedBookYOffset,
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
      const targetOffset =
        camera.position.y - bookSpring.posY.get() + focusedBookYOffset;
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
    if (typeof window === 'undefined') return;
    
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

    const handleResize = debounce(() => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, 100);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    return () => {
      handleResize.cancel();
      if (typeof window !== 'undefined') {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
      }
    };
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
      scale={bookSpring.scale}
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
