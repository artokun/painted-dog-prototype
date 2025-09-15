import { cn } from "@/lib/utils";
import { Html, useScroll } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { filterStore } from "@/app/store/filterStore";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  YouTube,
  TikTok,
  XTwitter,
  Bluesky,
} from "./icons/social";
import { ChainSwitch } from "./icons/ChainSwitch";
import { animated, useSpring } from "@react-spring/web";
import { ThreeLink } from "./ThreeLink";

export const Footer = () => {
  const middleDivRef = useRef<HTMLDivElement>(
    document.getElementById("middle") as HTMLDivElement
  );
  // Code smell alert!: can't use ref because it's not available in the useEffect hook when
  // inside the Html component
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const scroll = useScroll();

  useEffect(() => {
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0.2) {
            filterStore.isHidden = true;
          } else {
            filterStore.isHidden = false;
          }
        });
      },
      {
        threshold: [0, 0.2, 1],
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [target]);

  return (
    <Html
      zIndexRange={[0.1, 0]}
      className={cn("w-dvw h-[800px] pointer-events-none")}
      position={[0, -0.03, 0]}
      portal={middleDivRef}
    >
      <div
        ref={setTarget}
        onWheel={(e) => {
          scroll.el.scrollTop += e.deltaY;
        }}
        className="w-full h-full -translate-x-1/2 pointer-events-auto"
      >
        <FooterContent />
      </div>
    </Html>
  );
};

export const FooterContent = () => {
  const [spring, springApi] = useSpring(() => ({
    y: -10,
    config: { tension: 300, friction: 10 },
  }));

  const onChainSwitchClick = () => {
    springApi.start({
      y: -5,
      onRest: () => {
        springApi.start({ y: -10 });
      },
    });
  };

  return (
    <div className="flex flex-col align-center w-full h-full overflow-hidden bg-[#2F2F2F] p-16 gap-4 font-secondary">
      <div className="flex justify-center items-center">
        <div className="relative">
          <Image
            src="/logo-dog.png"
            priority
            alt="Logo"
            width={200}
            height={200}
          />
          <animated.div
            className="absolute -right-6 -top-16 cursor-pointer"
            style={spring}
            onClick={onChainSwitchClick}
          >
            <ChainSwitch />
          </animated.div>
        </div>
      </div>
      <div className="flex justify-center items-center gap-5 text-[16px] mt-4 [&>button]:hover:text-white [&>button]:transition-colors">
        <ThreeLink href="/about">About</ThreeLink>
        <ThreeLink href="/contact">Contact</ThreeLink>
        <ThreeLink href="/newsletter">Newsletter</ThreeLink>
      </div>
      <div className="flex text-xs justify-center items-center">
        <ThreeLink href="/legal" className="hover:text-white transition-colors">
          Legal
        </ThreeLink>
      </div>
      <div className="flex justify-center items-center gap-2 mt-4 [&>button]:hover:text-white [&>button]:transition-colors">
        <ThreeLink href="#">
          <Instagram />
        </ThreeLink>
        <ThreeLink href="#">
          <Facebook />
        </ThreeLink>
        <ThreeLink href="#">
          <YouTube />
        </ThreeLink>
        <ThreeLink href="#">
          <TikTok />
        </ThreeLink>
        <ThreeLink href="#">
          <XTwitter />
        </ThreeLink>
        <ThreeLink href="#">
          <Bluesky />
        </ThreeLink>
      </div>
    </div>
  );
};
