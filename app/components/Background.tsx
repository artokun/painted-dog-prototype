import { useSnapshot } from "valtio";
import { filterStore } from "../store/filterStore";
import { animated, useSpring } from "@react-spring/web";

export const Background = () => {
  const { search } = useSnapshot(filterStore);

  const spring = useSpring({
    color: search.length <= 1 ? "#F9F6F0" : "#111",
  });

  return (
    <animated.div
      className="h-full w-full flex items-center justify-center flex-col flex-wrap text-9xl font-fields text-black pointer-events-none bg-[#F9F6F0]"
      style={{ backgroundColor: spring.color }}
    >
      <div className="opacity-10">
        <h1>painted dog</h1>
        <h1>painted dog</h1>
        <h1>painted dog</h1>
        <h1>painted dog</h1>
      </div>
    </animated.div>
  );
};
