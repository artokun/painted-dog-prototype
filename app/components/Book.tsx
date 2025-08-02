import { useMemo, useRef } from "react";
import { Center, Text, Text3D } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  animated,
  config,
  useChain,
  useSpring,
  useSpringRef,
} from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { Book as BookType } from "@/types/book";
import {
  calculateOptimalZDistance,
  getBookSize,
  getBookSortYPosition,
  getDropHeight,
  getSpineFontSize,
  wrapText,
} from "../utils/book";

function Book(book: BookType) {
  const { books, sortBy, sortOrder, focusedBookId } = useSnapshot(bookStore);
  const { camera } = useThree();
  const isFocused = useMemo(() => focusedBookId === book.id, [focusedBookId]);
  const isSlidingRef = useRef(false);

  const bookRef = useSpringRef();
  const [bookSpring] = useSpring(
    {
      ref: bookRef,
      to: {
        posX: book.isFeatured ? 0 : Math.random() * 0.01 - 0.005,
        posY: getBookSortYPosition(book.id, books, sortBy, sortOrder),
        posZ: book.isFeatured ? 0 : Math.random() * 0.01 - 0.005,
        rotX: 0,
        rotY: book.isFeatured ? 0 : Math.random() * 0.02 - 0.01,
        rotZ: 0,
      },
      config: config.gentle,
    },
    [sortBy, sortOrder]
  );

  const bookFocusedSlideRef = useSpringRef();
  const [bookFocusedSlideSpring] = useSpring(
    {
      ref: bookFocusedSlideRef,
      to: isFocused
        ? {
            posZ: calculateOptimalZDistance(),
          }
        : {
            posZ: 0,
          },
      onStart: () => {
        isSlidingRef.current = true;
      },
      onRest: () => {
        isSlidingRef.current = false;
      },
      config: config.gentle,
    },
    [isFocused]
  );

  const dropHeight = useMemo(
    () => getDropHeight(book.id, focusedBookId, books, sortBy, sortOrder),
    [book.id, focusedBookId, books, sortBy, sortOrder]
  );

  const bookFocusedLiftRef = useSpringRef();
  const [bookFocusedLiftSpring, liftApi] = useSpring(
    {
      ref: bookFocusedLiftRef,
      to: isFocused
        ? {
            posY: camera.position.y - bookSpring.posY.get(),
            rotX: -Math.PI / 2,
            rotY: -Math.PI / 2,
          }
        : {
            posY: -dropHeight,
            rotX: book.isFeatured ? -Math.PI / 2 : 0,
            rotY: book.isFeatured ? -Math.PI / 2 : 0,
          },
      config: config.default,
      delay: !isFocused && dropHeight > 0 ? 250 : 0,
    },
    [isFocused, dropHeight]
  );

  useChain(
    isFocused
      ? [bookFocusedSlideRef, bookFocusedLiftRef]
      : [bookFocusedLiftRef, bookFocusedSlideRef],
    isFocused ? [0, 0.3] : [0, 0.5]
  );

  const handleClick = (e: React.MouseEvent<THREE.Mesh>) => {
    e.stopPropagation();

    if (isFocused) {
      bookStore.focusedBookId = null;
    } else {
      bookStore.focusedBookId = book.id;
    }
  };

  useFrame(() => {
    if (isFocused && !isSlidingRef.current) {
      const targetOffset = camera.position.y - bookSpring.posY.get();
      liftApi.start({ posY: targetOffset });
    }
  });

  const [width, height, depth] = getBookSize(book.size);
  const bookAuthor = `${book.firstName} ${book.surname}`;

  return (
    <animated.group
      position-x={bookSpring.posX}
      position-y={bookSpring.posY}
      position-z={bookSpring.posZ}
      rotation-x={bookSpring.rotX}
      rotation-y={bookSpring.rotY}
      rotation-z={bookSpring.rotZ}
      onClick={handleClick}
    >
      <animated.group
        position-z={bookFocusedSlideSpring.posZ}
        position-y={bookFocusedLiftSpring.posY}
        rotation-x={bookFocusedLiftSpring.rotX}
        rotation-y={bookFocusedLiftSpring.rotY}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={book.color}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
        <group>
          <CoverText
            title={book.title}
            author={bookAuthor}
            width={width}
            height={height}
          />
          <SpineText
            title={book.title}
            author={bookAuthor}
            width={width}
            depth={depth}
          />
        </group>
      </animated.group>
    </animated.group>
  );
}

const SpineText = ({
  title,
  author,
  width,
  depth,
}: {
  title: string;
  author: string;
  width: number;
  depth: number;
}) => {
  return (
    <group>
      <Text
        position={[-width / 2 + 0.006, 0, depth / 2 + 0.0002]}
        rotation={[0, 0, 0]}
        fontSize={getSpineFontSize(title)}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
        font="/fonts/fields-bold.otf"
        raycast={() => null}
      >
        {title}
      </Text>
      );
      {/* Author - On the spine facing forward, right aligned */}
      <Text
        position={[width / 2 - 0.006, 0, depth / 2 + 0.0002]}
        rotation={[0, 0, 0]}
        fontSize={0.005}
        color="#cccccc"
        anchorX="right"
        anchorY="middle"
        fontWeight={300}
        raycast={() => null}
      >
        {author}
      </Text>
    </group>
  );
};

const CoverText = ({
  title,
  author,
  width,
  height,
}: {
  title: string;
  author: string;
  width: number;
  height: number;
}) => {
  const lines = wrapText(title);
  const lineHeight = 0.012; // Space between lines
  const totalHeight = (lines.length - 1) * lineHeight;
  const startY = totalHeight / 2;

  return lines.map((line, index) => (
    <group key={index}>
      <Center
        key={index}
        position={[
          0.01 - (index * lineHeight - startY),
          -height / 2 - 0.0001,
          0,
        ]}
      >
        <Text3D
          rotation={[Math.PI / 2, 0, -Math.PI / 2]}
          font="/FSP DEMO - Fields Display_Bold.json"
          size={0.009}
          height={0.0005} // Extrusion depth
          curveSegments={12}
          bevelEnabled={true}
          bevelThickness={0.00005}
          bevelSize={0.00005}
          bevelOffset={0}
          bevelSegments={5}
          letterSpacing={0}
          raycast={() => null}
        >
          {line}
          <meshStandardMaterial
            color={new THREE.Color(0.5, 0.5, 0.3)}
            metalness={0.9}
            roughness={0.4}
          />
        </Text3D>
      </Center>
      <Text
        position={[-0.02, -height / 2 - 0.0002, 0]}
        rotation={[Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.006}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
        fontWeight={300}
        raycast={() => null}
        maxWidth={width * 0.8}
        textAlign="center"
      >
        {author}
      </Text>
    </group>
  ));
};

export default Book;
