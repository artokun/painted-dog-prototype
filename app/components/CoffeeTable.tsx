import * as THREE from "three";
import React from "react";
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

export function CoffeeTable(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/coffee_table.glb"
  ) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <mesh
          receiveShadow
          geometry={nodes.Table__0.geometry}
          material={materials["Scene_-_Root"]}
        />
        <mesh
          receiveShadow
          geometry={nodes.Table__0_1.geometry}
          material={materials["Scene_-_Root"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/coffee_table.glb");
