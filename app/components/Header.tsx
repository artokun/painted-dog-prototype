import Link from "next/link";
import { useSnapshot } from "valtio";
import { filterStore } from "../store/filterStore";
import { animated, useSpring } from "@react-spring/web";

export const Header = () => {
  const { search } = useSnapshot(filterStore);
  const isSearching = search.length > 1;
  const spring = useSpring({
    color: !isSearching ? "#000000" : "#ffffff",
    borderColor: !isSearching ? "#000000" : "#dadada",
    backgroundColor: !isSearching ? "#ffffff11" : "#00000000",
  });
  return (
    <animated.div
      style={spring}
      className="fixed top-0 left-0 w-full flex items-center justify-center z-20 font-[500] border-b-1 backdrop-blur-sm pointer-events-auto"
    >
      <div className="flex items-center justify-between max-w-screen-lg mx-auto gap-4 px-4 h-18 w-full">
        <div className="flex gap-2 items-center flex-1">
          <Link href="/reviews">Reviews</Link>
          <span>&middot;</span>
          <Link href="/newsletter">Newsletter</Link>
        </div>
        <h1 className="text-4xl flex justify-center whitespace-nowrap items-center text-center font-fields font-[600] flex-1">
          painted dog
        </h1>
        <div className="gap-2 items-center flex-1 flex justify-end">
          <Link href="/podcast">Podcast</Link>
          <button>Menu</button>
        </div>
      </div>
    </animated.div>
  );
};
