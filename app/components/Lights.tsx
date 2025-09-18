import { useControls } from "leva";
import { animated } from "@react-spring/three";

export default function Lights() {
  const { lightPosition, lightIntensity, lightColor } = useControls(
    "Camera Light",
    {
      lightPosition: {
        value: [-1, 0, 2],
        min: -10,
        max: 10,
        step: 0.01,
      },
      lightIntensity: {
        value: 4.0,
        min: 0,
        max: 10,
        step: 0.01,
      },
      lightColor: {
        value: "#FFFFFF",
      },
    }
  );

  const { ambientLightIntensity } = useControls("Ambient Light", {
    ambientLightIntensity: {
      value: 0.5,
      min: 0,
      max: 5,
      step: 0.01,
      label: "Intensity",
    },
  });

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
