"use client";

import { ReactNode, useState } from "react";
import { globalStore } from "../store/globalStore";
import { LinkProps } from "next/link";
import { cn } from "@/lib/utils";
import { animated, useSpring } from "@react-spring/web";

/*
This is a wrapper around the next/link component that allows us to navigate to the current route when the url changes from
inside of the react three fiber app. See Foreground.tsx for more details.
*/
export const ThreeLink = ({
  href,
  target,
  children,
  className,
  animatedUnderline = false,
  noUnderline = false,
}: LinkProps<"a"> & {
  children: ReactNode;
  className?: string;
  animatedUnderline?: boolean;
  noUnderline?: boolean;
  target?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const underlineSpring = useSpring({
    width: isPressed ? 1 : isHovered ? 1 : -0.0001,
    x: isPressed ? 100 : 0,
    opacity: isHovered && !isPressed ? 1 : 0,
    config: { tension: 400, friction: 25, mass: 1 },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (href && href !== "#") {
      if (typeof window !== "undefined") {
        if (target) {
          // If target is specified (e.g., "_blank"), use window.open
          window.open(href.toString(), target);
        } else {
          // Default behavior: use internal navigation
          globalStore.currentRoute = href.toString();
        }
      }
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      className={cn(
        "appearance-none cursor-pointer relative inline-block overflow-hidden",
        href && !animatedUnderline && !noUnderline && "underline",
        animatedUnderline && "pb-1",
        className
      )}
    >
      {children}
      {animatedUnderline && (
        <animated.span
          className="absolute left-0 h-0.5 bg-black origin-left text-[0px]"
          style={{
            bottom: "5px",
            width: underlineSpring.width.to((width) => `${width * 100}%`),
            opacity: underlineSpring.opacity
              .to([0, 1], [0, 10])
              .to((opacity) => `${Math.min(opacity, 1)}`),
            transform: underlineSpring.x.to((x) => `translateX(${x}%)`),
          }}
        />
      )}
    </button>
  );
};
