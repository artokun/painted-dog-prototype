import { forwardRef, RefObject, useState, Suspense } from "react";
import {
  Bloom,
  EffectComposer,
  GodRays,
  Vignette,
} from "@react-three/postprocessing";
import { useControls, folder } from "leva";
import { KernelSize, Resolution } from "postprocessing";
import { Circle } from "@react-three/drei";
import { Mesh } from "three";

const Sun = forwardRef(function Sun(
  props: {
    scale: number;
    position: [number, number, number];
    color: string;
    rayIntensity: number;
    lightIntensity: number;
    godRaysEnabled: boolean;
  },
  forwardRef
) {
  return (
    <>
      <Circle
        visible={props.godRaysEnabled}
        args={[props.scale, props.scale]}
        ref={forwardRef as RefObject<Mesh>}
        position={props.position as any}
      >
        <meshBasicMaterial
          color={props.color}
          transparent
          depthWrite={false}
          opacity={props.rayIntensity}
        />
      </Circle>
      <directionalLight
        position={props.position as any}
        lookAt={[0, 0, 0]}
        intensity={props.lightIntensity}
        color={props.color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.001}
        shadow-camera-far={10}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0002}
        shadow-normalBias={0.0002}
      />
    </>
  );
});

export default function Effects({ enabled }: { enabled: boolean }) {
  const [material, setMaterial] = useState<Mesh>();

  const {
    position,
    lightIntensity,
    godRaysEnabled,
    raysIntensity,
    color,
    exposure,
    decay,
    blur,
    samples,
  } = useControls("Effects - GodRays", {
    godRaysEnabled: {
      value: true,
    },
    advanced: folder(
      {
        exposure: {
          value: 0.34,
          min: 0.33,
          max: 2,
        },
        decay: {
          value: 0.9,
          min: 0.87,
          max: 0.99,
          step: 0.001,
        },
        blur: {
          value: true,
        },
        position: {
          value: [-3.4, 4.19, -0.9],
          min: -5,
          max: 5,
          step: 0.1,
        },
        lightIntensity: {
          value: 5.0,
          min: 0,
          max: 10,
          step: 0.01,
        },
        raysIntensity: {
          value: 0.13,
          min: 0.001,
          max: 1,
          step: 0.001,
        },
        color: {
          value: "#FFFFFF",
        },
        samples: {
          value: 512,
          min: 1,
          max: 1024,
          step: 1,
        },
      },
      {
        collapsed: !enabled,
      }
    ),
  });

  const { bloomIntensity, bloomEnabled } = useControls("Effects - Bloom", {
    bloomEnabled: {
      value: true,
    },
    advanced: folder(
      {
        bloomIntensity: {
          value: 1.0,
          min: 0,
          max: 5,
          step: 0.01,
        },
      },
      {
        collapsed: !enabled,
      }
    ),
  });
  const { vignetteEnabled } = useControls("Effects - Vignette", {
    vignetteEnabled: {
      value: true,
    },
  });

  return (
    <Suspense fallback={null}>
      {/* sun light */}
      <Sun
        ref={setMaterial}
        scale={20}
        position={position}
        color={color}
        rayIntensity={raysIntensity}
        lightIntensity={lightIntensity}
        godRaysEnabled={enabled && godRaysEnabled}
      />

      {material && (
        <EffectComposer enabled={enabled} multisampling={8}>
          <GodRays
            sun={material}
            // blendFunction={BlendFunction.SCREEN} // The blend function of this effect.
            samples={samples} // The number of samples per pixel.
            // density={0.96} // The density of the light rays.
            decay={decay} // An illumination decay factor.
            // weight={0.4} // A light ray weight factor.
            exposure={exposure} // A constant attenuation coefficient.
            // clampMax={1} // An upper bound for the saturation of the overall effect.
            width={Resolution.AUTO_SIZE} // Render width.
            height={Resolution.AUTO_SIZE} // Render height.
            kernelSize={KernelSize.SMALL} // The blur kernel size. Has no effect if blur is disabled.
            blur={blur} // Whether the god rays should be blurred to reduce artifacts.
          />
          <Bloom
            intensity={bloomEnabled ? bloomIntensity : 0}
            kernelSize={KernelSize.LARGE} // blur kernel size
            luminanceThreshold={0.9}
            luminanceSmoothing={0.025}
            mipmapBlur={true}
            resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
            resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
          />
          <Vignette opacity={vignetteEnabled ? 1 : 0} />
        </EffectComposer>
      )}
    </Suspense>
  );
}
