import { animated, useSpring } from "@react-spring/web";
import { PDButton } from "./ui/PDButton";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const NotFoundContent = ({ visible }: { visible: boolean }) => {
  const [showContent, setShowContent] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  const style = useSpring({
    opacity: visible ? 1 : 0,
    x: visible ? 0 : 100,
    delay: visible ? 300 : 50,
    onStart: () => {
      setShowContent(true);
    },
    onRest: () => {
      setShowContent(visible);
    },
  });

  return (
    <animated.div
      style={style}
      className={cn(
        "absolute inset-0 h-dvh w-dvw text-black z-10 overflow-y-auto pointer-events-none overflow-x-hidden flex flex-col",
        visible && "pointer-events-auto"
      )}
    >
      {showContent && (
        <>
          <div className="flex flex-col flex-1 gap-5 items-center justify-center max-w-md text-center mx-auto w-full mt-20 px-2 pt-20">
            <h1 className="text-5xl font-medium">404</h1>
            <div className="w-80 h-80 mt-10">
              {isSafari ? (
                <img
                  src="/dog-loop-alpha.png"
                  alt="Painted Dog"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src="/dog-loop-alpha.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <p className="text-md">
              Whoops! There&apos;s a problem with the link.
            </p>
            <p className="text-md">
              Not to worry though, you can continue to browse from the homepage.
            </p>
            <PDButton
              href="/"
              className="w-full max-w-[250px] mt-8"
              primary
              tall
            >
              Back to home
            </PDButton>
          </div>
          <Footer />
        </>
      )}
    </animated.div>
  );
};
