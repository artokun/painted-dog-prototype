import Link from "next/link";
import { useSnapshot } from "valtio";
import { filterStore } from "../store/filterStore";
import { animated, useSpring } from "@react-spring/web";
import { Leva } from "leva";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { search } = useSnapshot(filterStore);
  const isSearching = search.length > 1;
  const spring = useSpring({
    color: !isSearching ? "#000000" : "#ffffff",
    borderColor: !isSearching ? "#00000000" : "#dadada66",
    backgroundColor: !isSearching ? "#fffee922" : "#00000000",
  });

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [levaLoaded, setLevaLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLevaLoaded(true);
    }, 1000);
  }, []);

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
      <div
        className={cn(
          "absolute top-0 right-0 opacity-0 hover:opacity-100 transition-opacity duration-300",
          levaLoaded
            ? isCollapsed
              ? "opacity-30"
              : "opacity-100"
            : "opacity-0"
        )}
      >
        <Leva
          collapsed={{ collapsed: isCollapsed, onChange: setIsCollapsed }}
          isRoot
        />
      </div>
    </animated.div>
  );
};
