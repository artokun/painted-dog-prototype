import { animated, useSpring } from "@react-spring/web";
import { PDButton } from "./ui/PDButton";
import { Footer } from "./Footer";

export const NotFoundContent = ({ visible }: { visible: boolean }) => {
  const style = useSpring({
    opacity: visible ? 1 : 0,
  });

  return (
    <animated.div
      style={style}
      className="absolute inset-0 h-dvh w-dvw text-black z-10 overflow-y-auto pointer-events-auto overflow-x-hidden flex flex-col"
    >
      <div className="flex flex-col flex-1 gap-5 items-center justify-center max-w-lg text-center mx-auto w-full mt-20 px-2 pt-20">
        <h1 className="text-5xl font-medium">404</h1>
        <div className="w-80 h-80 mt-10">
          <video
            src="/dog-loop.mp4"
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-lg">Whoops! There's a problem with the link.</p>
        <p className="text-lg">
          Not to worry though, you can continue to browse from the homepage.
        </p>
        <PDButton href="/" className="w-full max-w-[250px] mt-8" primary tall>
          Back to home
        </PDButton>
      </div>
      <Footer />
    </animated.div>
  );
};
