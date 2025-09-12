import { useControls } from "leva";
import { MaterialProperties } from "three";

export function useBookMaterialControls(): Partial<MaterialProperties> {
  return useControls("Book Material", {
    metalness: { value: 0, min: 0, max: 1, step: 0.01 },
    roughness: { value: 0.6, min: 0, max: 1, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 2.333, step: 0.01 },
    transmission: { value: 0, min: 0, max: 1, step: 0.01 },
    thickness: { value: 0.5, min: 0, max: 5, step: 0.01 },
    clearcoat: { value: 0, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    specularIntensity: { value: 1, min: 0, max: 1, step: 0.01 },
    specularColor: { value: "#ffffff", label: "Specular Color" },
  }) as Partial<MaterialProperties>;
}
