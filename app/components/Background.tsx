import { useSnapshot } from "valtio";
import { filterStore, FilterView } from "../store/filterStore";
import { animated, useSpring } from "@react-spring/web";

export const Background = () => {
  const { search, view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;

  const spring = useSpring({
    color: !isGridMode && search.length > 1 ? "#111" : "#F5E9DC",
  });

  return (
    <animated.div
      className="h-full w-full flex items-center justify-center flex-col flex-wrap text-9xl font-fields text-black pointer-events-none bg-[#F5E9DC]"
      style={{ backgroundColor: spring.color }}
    >
      <div className="opacity-10">
        {/* <h1>painted dog</h1>
        <h1>painted dog</h1>
        <h1>painted dog</h1>
        <h1>painted dog</h1> */}
      </div>
    </animated.div>
  );
};
