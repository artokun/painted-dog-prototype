import { useEffect, useRef } from "react";
import { Center, Text, Text3D } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { animated, config, useSpring } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { Book as BookType } from "@/types/book";
import {
  getBookSize,
  getBookSortYPosition,
  getSpineFontSize,
  wrapText,
} from "../utils/book";
import { Euler, EulerOrder, Vector3 } from "three";

function Book(book: BookType) {
  const bookRef = useRef<THREE.Group>(null);
  const { books, sortBy, sortOrder } = useSnapshot(bookStore);
  const { camera } = useThree();

  const [width, height, depth] = getBookSize(book.size);

  const bookAuthor = `${book.firstName} ${book.surname}`;

  const [springs] = useSpring(() => ({
    posX: 0,
    posY: getBookSortYPosition(book.id, books, sortBy, sortOrder),
    posZ: 0,
    rotX: book.isFeatured ? -Math.PI / 2 : 0,
    rotY: book.isFeatured ? -Math.PI / 2 : Math.random() * 0.05 - 0.025,
    rotZ: 0,
    config: config.gentle,
  }));

  return (
    <animated.group
      ref={bookRef}
      position-x={springs.posX}
      position-y={springs.posY}
      position-z={springs.posZ}
      rotation-x={springs.rotX}
      rotation-y={springs.rotY}
      rotation-z={springs.rotZ}
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
