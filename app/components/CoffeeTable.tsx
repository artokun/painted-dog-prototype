import * as THREE from "three";
import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { ThreeElements } from "@react-three/fiber";

type GLTFResult = GLTF & {
  nodes: {
    Table__0: THREE.Mesh;
    Table__0_1: THREE.Mesh;
  };
  materials: {
    ["Scene_-_Root"]: THREE.MeshStandardMaterial;
  };
};

type CoffeeTableProps = ThreeElements["group"] & {
  opacity?: number;
};

export function CoffeeTable({ opacity = 1, ...props }: CoffeeTableProps) {
  const { nodes, materials } = useGLTF(
    "/coffee_table.glb"
  ) as unknown as GLTFResult;

  // Create a modified material with opacity
  const tableMaterial = useMemo(() => {
    const mat = materials["Scene_-_Root"].clone();
    mat.transparent = true;
    mat.opacity = opacity;
    return mat;
  }, [materials, opacity]);

  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <mesh
          receiveShadow
          geometry={nodes.Table__0.geometry}
          material={tableMaterial}
        />
        <mesh
          receiveShadow
          geometry={nodes.Table__0_1.geometry}
          material={tableMaterial}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/coffee_table.glb");
