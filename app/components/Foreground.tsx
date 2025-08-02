import { Header } from "./Header";
import { FloatingBar } from "./FloatingBar";
import { Loader } from "@react-three/drei";

export const Foreground = () => {
  return (
    <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center flex-col z-20 pointer-events-none">
      <Header />
      <FloatingBar />
      <Loader />
    </div>
  );
};
