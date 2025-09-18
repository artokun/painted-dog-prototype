import Link from "next/link";
import { useSnapshot } from "valtio";
import { filterStore } from "../store/filterStore";
import { animated, useSpring } from "@react-spring/web";
import { Leva } from "leva";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";
import Image from "next/image";
import { MenuIcon, ShoppingCartIcon } from "lucide-react";

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
        <div className="flex-1">
          <div className="hidden lg:flex gap-2 items-center">
            <Link href="/about">About</Link>
            <span>•</span>
            <Link href="/about/#who-we-are">Who We Are</Link>
          </div>
          <div className="lg:hidden flex gap-2 items-center">
            <Link href="/">
              <ShoppingCartIcon />
            </Link>
          </div>
        </div>
        <h1 className="text-4xl flex justify-center whitespace-nowrap items-center text-center font-fields font-[600] flex-1">
          <Link href="/">
            <Image
              className="lg:hidden object-contain"
              src="/logo-dog-stacked.png"
              alt="Logo"
              height={60}
              width={120}
            />
            <span className="hidden lg:block text-4xl">painted dog</span>
          </Link>
        </h1>
        <div className="gap-2 items-center flex-1 flex justify-end">
          <div className="hidden lg:flex gap-2 items-center">
            <Link href="/contact">Contact</Link>
          </div>
          <div className="lg:hidden flex gap-2 items-center">
            <MenuIcon />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "hidden lg:block absolute top-0 right-0 opacity-0 hover:opacity-100 transition-opacity duration-300",
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
