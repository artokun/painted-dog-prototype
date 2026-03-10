"use client";

import { forwardRef, useState, useEffect } from "react";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
import { useSnapshot } from "valtio";
import { animated, useSpring } from "@react-spring/web";
import { globalStore } from "@/app/store/globalStore";
import { bookStore } from "@/app/store/bookStore";
import { useMediaQuery } from "usehooks-ts";
import { PurchaseButtons } from "./PurchaseButtons";
import { PDButton } from "./ui/PDButton";

export const HomeContent = forwardRef<HTMLDivElement, {}>((_, ref) => {
  const { currentRoute } = useSnapshot(globalStore);
  const { focusedBookId } = useSnapshot(bookStore);
  const isHomePage = currentRoute === "/";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    setHasInitialized(true);
  }, []);

  const styles = useSpring({
    opacity: isHomePage && !focusedBookId ? 1 : 0,
    config: { tension: 400, friction: 35 },
    immediate: !hasInitialized,
  });

  return (
    <animated.section
      ref={ref}
      style={styles}
      className={cn(
        "relative w-full max-w-[100vw] text-black flex flex-col gap-10 pb-20 md:pb-0 pointer-events-none"
      )}
    >
      {/* Spacer pushes content below the 3D scene — pointer-events-none so Canvas stays clickable */}
      <div className="h-[75dvh]" />
      <div
        className={cn(
          "flex flex-col gap-10 pointer-events-auto",
          !isHomePage && "pointer-events-none"
        )}
      >
        <div
          id="home-copy-start"
          className="flex flex-col md:flex-row gap-12 justify-around mx-auto max-w-3xl px-8 md:px-0"
        >
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-xl font-medium">
              An expansive publication in full colour showcasing decades&apos;
              worth of illustration done in hundreds of sketchbooks and journals
              by the creators of the biting satirical comic{" "}
              <u>
                <i>Bitterkomix.</i>
              </u>
            </h3>
          </div>
          <div className="flex-1 gap-4 flex flex-col">
            <PurchaseButtons layout="horizontal" isMobile={isMobile} />
          </div>
        </div>
        <div className="border-b border-black w-[calc(100dvw-64px)] max-w-[400px] mx-auto h-px pt-10 md:pt-3 mb-10 md:mb-0" />
        <div className="flex flex-col md:flex-row gap-20 md:gap-10 max-w-[540px] mx-auto px-8 md:px-0">
          <article className="flex-1 flex flex-col gap-4 text-center">
            <h3 className="text-[32px] font-semibold">
              So, what&apos;s next ?
            </h3>
            <p>
              We have many a literary treat for book lovers of all kinds in the
              works. Join our newsletter community to be the first to get
              exclusive author interviews, book snippets and insider treats.
            </p>
            <PDButton
              onClick={() => (globalStore.isNewsLetterModalOpen = true)}
              className="w-full max-w-60 mx-auto"
            >
              Sign Up for Newsletter
            </PDButton>
          </article>
        </div>
        <Footer />
      </div>
    </animated.section>
  );
});

HomeContent.displayName = "HomeContent";
