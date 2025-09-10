import { proxy } from "valtio";

export interface MaterialProperties {
  metalness: number;
  roughness: number;
  ior: number;
  transmission: number;
  thickness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  specularIntensity: number;
  specularColor: string;
}

export const materialStore = proxy<MaterialProperties>({
  metalness: 0.1,
  roughness: 0.6,
  ior: 1.5,
  transmission: 0,
  thickness: 0.5,
  clearcoat: 0,
  clearcoatRoughness: 0.1,
  specularIntensity: 1,
  specularColor: "#ffffff",
});