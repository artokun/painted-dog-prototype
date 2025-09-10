import { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface BookMaterials {
  [key: string]: THREE.MeshStandardMaterial;
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

  useEffect(() => {
    // Configure and apply front texture
    if (frontTexture && materials[materialNames.front]) {
      configureMaterialTexture(frontTexture, materials[materialNames.front]);
    }

    // Configure and apply side texture with horizontal mirroring for spine text
    if (sideTexture && materials[materialNames.side]) {
      configureMaterialTexture(sideTexture, materials[materialNames.side], {
        mirrorHorizontal: true
      });
    }

    // Optionally apply front texture to back material if specified
    if (frontTexture && materialNames.back && materials[materialNames.back]) {
      configureMaterialTexture(frontTexture, materials[materialNames.back]);
    }
  }, [frontTexture, sideTexture, materials, materialNames]);

  return { frontTexture, sideTexture };
}

/**
 * Configure a Three.js texture for glTF materials
 * @param texture - The loaded texture
 * @param material - The material to apply the texture to
 * @param options - Additional configuration options
 */
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