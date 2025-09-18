import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  BookXS,
  BookSM,
  BookMD,
  BookLG,
  BookXL,
  Book280x260,
} from "../models/books";
import {
  animated,
  config,
  useChain,
  useSpring,
  useSpringRef,
} from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../../store/bookStore";
import { Book as BookType } from "@/types/app";
import {
  calculateOptimalZDistance,
  calculateSortGridPosition,
  getContentfulBookSize,
  getBookSortYPosition,
  getCurrentBookIndex,
  getDropHeight,
  calculateFocusedBookCenterOffset,
  getBookSortXPostition,
} from "../../utils/book";
import { filterStore, FilterView } from "../../store/filterStore";
import { subscribeKey } from "valtio/utils";
import { MeshStandardMaterialProperties } from "three";

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
  const isGridMode = view === FilterView.Grid;
  const isSlidingRef = useRef(false);
  const wasFocusedRef = useRef(false);
  const [bookFlipped, setBookFlipped] = useState(false);

  useEffect(() => {
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
  }, []);

  const [width, thickness, height] = getContentfulBookSize(book.bookSize);

  const bookPosition = getBookSortXPostition(book.id);

  const stackAnimation = useMemo(
    () => ({
      posX: bookPosition.posX,
      posY: height / 2,
      posZ: -width / 2,
      rotX: 0,
      rotY: 0,
      rotZ: -Math.PI / 2,
    }),
    [height, bookPosition, width]
  );

  const gridAnimation = {
    posX: 0,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  };

  const bookSpring = useSpring(isGridMode ? gridAnimation : stackAnimation);

  return (
    <animated.group
      name="book"
      position-x={bookSpring.posX}
      position-y={bookSpring.posY}
      position-z={bookSpring.posZ}
      rotation-x={bookSpring.rotX}
      rotation-y={bookSpring.rotY}
      rotation-z={bookSpring.rotZ}
    >
      <BookModel book={book} materialControls={materialControls} />
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

  return (
    <Suspense fallback={null}>
      <SelectedBookModel book={book} materialControls={materialControls} />
    </Suspense>
  );
};

export default Book;
