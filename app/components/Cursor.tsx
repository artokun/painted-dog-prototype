import { useState, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { CursorSvg, CursorSvgHandle } from "./CursorSvg";
import { useSpring, animated } from "@react-spring/web";
import { cn } from "@/lib/utils";

export const Cursor = () => {
  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    nx: 0.5,
    ny: 0.5,
  });
  const { hoveredBookId, focusedBookId, isRendered } = useSnapshot(bookStore);
  const [pressed, setPressed] = useState(false);
  const [text, setText] = useState("Focus Book");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [flipPressed, setFlipPressed] = useState(false);
  const cursorSvgRef = useRef<CursorSvgHandle>(null);

  const style = useSpring({
    x: mousePosition.x,
    y: mousePosition.y,
    immediate: true,
  });

  useEffect(() => {
    scrollRef.current = document.getElementById("scroll-el") as HTMLDivElement;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        nx: e.clientX / window.innerWidth,
        ny: e.clientY / window.innerHeight,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Only trigger flip animation if a book is focused and cursor is hovering
      if (focusedBookId && hoveredBookId === focusedBookId) {
        setFlipPressed(true);
        setTimeout(() => setFlipPressed(false), 200);
      }
      cursorSvgRef.current?.blink(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isRendered, focusedBookId, hoveredBookId]);

  useEffect(() => {
    const TIME = 200;
    setPressed(true);
    setTimeout(() => {
      setText(!focusedBookId ? "Flip" : "Focus");
    }, TIME / 2);
    setTimeout(() => {
      setText(focusedBookId ? "Flip" : "Focus");
      setPressed(false);
    }, TIME);
  }, [focusedBookId]);

  return (
    <animated.div
      style={style}
      className="absolute top-0 left-0 h-20 w-20 translate-x-[-50%] translate-y-[-50%]"
    >
      <div
        className={cn(
          "flex items-center justify-cente rounded-full text-white w-full h-full text-center leading-none transition-all duration-200",
          hoveredBookId ? "opacity-100" : "opacity-0",
          hoveredBookId
            ? pressed
              ? "scale-50"
              : flipPressed
                ? "scale-90"
                : "scale-100"
            : "scale-0"
        )}
      >
        <CursorSvg
          ref={cursorSvgRef}
          text={text}
          mousePosition={mousePosition}
          scrollRef={scrollRef}
          focusedBookId={focusedBookId}
        />
      </div>
    </animated.div>
  );
};
