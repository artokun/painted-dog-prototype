import { useControls } from "leva";
import { MeshStandardMaterialProperties } from "three";

export function useBookMaterialControls(): Partial<MeshStandardMaterialProperties> {
  return useControls("Book Material", {
    metalness: { value: 0, min: 0, max: 1, step: 0.01 },
    roughness: { value: 0.6, min: 0, max: 1, step: 0.01 },
  });
}
