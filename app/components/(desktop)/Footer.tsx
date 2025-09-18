import { cn } from "@/lib/utils";
import { Html, useScroll } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { filterStore } from "@/app/store/filterStore";
import { FooterContent } from "../FooterContent";

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
