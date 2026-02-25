import { folder, useControls } from "leva";
import { animated } from "@react-spring/three";

export default function Lights() {
  const { lightPosition, lightIntensity, lightColor, ambientLightIntensity } =
    useControls(
      "Lights",
      {
        cameraLight: folder(
          {
            lightPosition: {
              value: [4, 1, 4],
              min: -10,
              max: 10,
              step: 0.01,
            },
            lightIntensity: {
              value: 2.0,
              min: 0,
              max: 10,
              step: 0.01,
            },
            lightColor: {
              value: "#FFFFFF",
            },
          },
          { collapsed: true }
        ),
        ambientLight: folder(
          {
            ambientLightIntensity: {
              value: 2,
              min: 0,
              max: 5,
              step: 0.01,
            },
          },
          { collapsed: true }
        ),
      },
      { collapsed: true }
    );

  return (
    <>
      <ambientLight intensity={ambientLightIntensity} />
      <animated.directionalLight
        position={lightPosition}
        rotation={[0, 0, 0]}
        intensity={lightIntensity}
        color={lightColor}
      />
    </>
  );
}
