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
      {/* <MovingSpot /> */}
    </>
  );
}

// function MovingSpot({ vec = new Vector3(), ...props }) {
//   const light = useRef<any>(null);
//   const { search, view } = useSnapshot(filterStore);
//   const isGridMode = view === FilterView.Grid;
//   const viewport = useThree((state) => state.viewport);

//   useFrame((state) => {
//     light.current.target.position.lerp(
//       vec.set(
//         (state.pointer.x * viewport.width) / 2,
//         (state.pointer.y * viewport.height) / 2,
//         0
//       ),
//       0.1
//     );
//     light.current.intensity = !isGridMode && search.length > 1 ? 4 : 0;
//     light.current.target.updateMatrixWorld();
//   });
//   return (
//     <SpotLight
//       castShadow={false}
//       shadow-mapSize={[4096, 4096]}
//       shadow-camera-near={0.001}
//       shadow-camera-far={1}
//       shadow-camera-left={-0.5}
//       shadow-camera-right={0.5}
//       shadow-camera-top={0.5}
//       shadow-camera-bottom={-0.5}
//       shadow-bias={-0.0001}
//       shadow-normalBias={0.0001}
//       ref={light}
//       penumbra={0.5}
//       distance={2}
//       angle={0.2}
//       attenuation={20}
//       anglePower={10}
//       {...props}
//     />
//   );
// }
