import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import { materialStore, MaterialProperties } from "../store/materialStore";

interface BookMaterials {
  [key: string]: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
}

interface BookTextures {
  front: string;
  side: string;
}

/**
 * Hook to load and apply book textures to glTF materials
 * @param textures - Object containing front and side texture URLs
 * @param materials - glTF materials object
 * @param materialNames - Object mapping texture types to material names
 */
// Hook for material properties controls that updates the valtio store
export function useBookMaterialControls() {
  const materialProps = useControls("Book Cover Material", {
    metalness: {
      value: materialStore.metalness,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Metalness",
      onChange: (value) => (materialStore.metalness = value),
    },
    roughness: {
      value: materialStore.roughness,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Roughness",
      onChange: (value) => (materialStore.roughness = value),
    },
    ior: {
      value: materialStore.ior,
      min: 1.0,
      max: 2.333,
      step: 0.01,
      label: "Index of Refraction",
      onChange: (value) => (materialStore.ior = value),
    },
    transmission: {
      value: materialStore.transmission,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Transmission",
      onChange: (value) => (materialStore.transmission = value),
    },
    thickness: {
      value: materialStore.thickness,
      min: 0,
      max: 5,
      step: 0.01,
      label: "Thickness",
      onChange: (value) => (materialStore.thickness = value),
    },
    clearcoat: {
      value: materialStore.clearcoat,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Clear Coat",
      onChange: (value) => (materialStore.clearcoat = value),
    },
    clearcoatRoughness: {
      value: materialStore.clearcoatRoughness,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Clear Coat Roughness",
      onChange: (value) => (materialStore.clearcoatRoughness = value),
    },
    specularIntensity: {
      value: materialStore.specularIntensity,
      min: 0,
      max: 2,
      step: 0.01,
      label: "Specular Intensity",
      onChange: (value) => (materialStore.specularIntensity = value),
    },
    specularColor: {
      value: materialStore.specularColor,
      label: "Specular Color",
      onChange: (value) => (materialStore.specularColor = value),
    },
  });

  return materialProps;
}

export function useBookTextures(
  textures: BookTextures,
  materials: BookMaterials,
  materialNames: {
    front: string;
    side: string;
    back?: string; // Optional back cover material
  }
) {
  // Load textures
  const frontTexture = useLoader(THREE.TextureLoader, textures.front);
  const sideTexture = useLoader(THREE.TextureLoader, textures.side);

  // Access materialStore directly in useFrame (no useSnapshot needed)

  // Track if textures have been configured
  const texturesConfigured = useRef(false);
  const lastPropsRef = useRef<MaterialProperties | null>(null);


  // Use useFrame to configure textures and update material properties
  useFrame(() => {
    // Configure textures once when they load
    if (frontTexture && sideTexture && !texturesConfigured.current) {
      // Configure front texture
      if (materials[materialNames.front]) {
        configureMaterialTexture(frontTexture, materials[materialNames.front]);
      }

      // Configure side texture with horizontal mirroring
      if (materials[materialNames.side]) {
        configureMaterialTexture(sideTexture, materials[materialNames.side], {
          mirrorHorizontal: true,
        });
      }

      // Configure back texture if specified
      if (materialNames.back && materials[materialNames.back]) {
        configureMaterialTexture(frontTexture, materials[materialNames.back]);
      }

      texturesConfigured.current = true;
    }

    if (!texturesConfigured.current) return;

    // Check if material properties have changed
    const propsChanged =
      !lastPropsRef.current ||
      Object.keys(materialStore).some(
        (key) =>
          materialStore[key as keyof MaterialProperties] !==
          lastPropsRef.current![key as keyof MaterialProperties]
      );

    if (propsChanged) {
      // Apply material properties to front material
      if (materials[materialNames.front]) {
        applyMaterialProperties(materials[materialNames.front], materialStore);
      }

      // Apply material properties to side material
      if (materials[materialNames.side]) {
        applyMaterialProperties(materials[materialNames.side], materialStore);
      }

      // Apply material properties to back material if specified
      if (materialNames.back && materials[materialNames.back]) {
        applyMaterialProperties(materials[materialNames.back], materialStore);
      }

      lastPropsRef.current = { ...materialStore };
    }
  });

  return { frontTexture, sideTexture };
}

// Configure a Three.js texture for glTF materials
function configureMaterialTexture(
  texture: THREE.Texture,
  material: THREE.MeshStandardMaterial,
  options: {
    mirrorHorizontal?: boolean;
  } = {}
) {
  // glTF materials expect maps with flipY=false and sRGB color space for color textures
  texture.flipY = false;

  // three@0.152+ uses colorSpace instead of encoding
  texture.colorSpace = THREE.SRGBColorSpace;

  // Improve texture quality
  texture.anisotropy = 8;

  // Handle horizontal mirroring for spine text readability
  if (options.mirrorHorizontal) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = 1;
    texture.offset.x = 0;
  }

  // Mark texture for update
  texture.needsUpdate = true;

  // Apply to material
  material.map = texture;
  material.needsUpdate = true;
}

// Apply material properties to a material
function applyMaterialProperties(
  material: THREE.MeshStandardMaterial,
  properties: MaterialProperties
) {
  // Apply basic material properties (available on both Standard and Physical)
  if (material.metalness !== properties.metalness)
    material.metalness = properties.metalness;
  if (material.roughness !== properties.roughness)
    material.roughness = properties.roughness;

  // Apply advanced physical material properties if it's a MeshPhysicalMaterial
  if (material instanceof THREE.MeshPhysicalMaterial) {
    // Set IOR (Index of Refraction) - range 1.0 to 2.333
    if (material.ior !== properties.ior) material.ior = properties.ior;

    // Set transmission properties
    if (material.transmission !== properties.transmission)
      material.transmission = properties.transmission;
    if (material.thickness !== properties.thickness)
      material.thickness = properties.thickness;

    // Critical: when transmission > 0, opacity MUST be 1
    if (properties.transmission > 0) {
      if (material.opacity !== 1) material.opacity = 1;
      if (!material.transparent) material.transparent = true;
    } else {
      if (material.transparent && material.opacity === 1) {
        material.transparent = false;
      }
    }

    // Set clearcoat properties
    if (material.clearcoat !== properties.clearcoat)
      material.clearcoat = properties.clearcoat;
    if (material.clearcoatRoughness !== properties.clearcoatRoughness)
      material.clearcoatRoughness = properties.clearcoatRoughness;

    // Set specular properties
    if (material.specularIntensity !== properties.specularIntensity)
      material.specularIntensity = properties.specularIntensity;

    // Only update color if it's different
    const currentColor = material.specularColor?.getHexString?.() || "ffffff";
    const newColor = properties.specularColor.replace("#", "");
    if (currentColor !== newColor) {
      material.specularColor = new THREE.Color(properties.specularColor);
    }
  }

  material.needsUpdate = true;
}
