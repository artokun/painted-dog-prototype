"use client";

import { animated, SpringValue } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@/app/components/icons/Plus";

interface MenuListProps {
  menuItems: readonly string[];
  menuTrail: Array<Record<string, SpringValue<any>>>;
  selectedIndex: number;
  onItemClick: (index: number) => void;
  formatAuthorNames: (authors: any[]) => string;
  book: any;
}

export function MenuList({
  menuItems,
  menuTrail,
  selectedIndex,
  onItemClick,
  formatAuthorNames,
  book,
}: MenuListProps) {
  const handleMenuItemClick = (e: React.MouseEvent<HTMLLIElement>) => {
    const index = parseInt(e.currentTarget.dataset.index || "0");
    // Toggle: if clicking the same item, reset to 0, otherwise set to clicked index
    onItemClick(selectedIndex === index ? 0 : index);
  };

  return (
    <ul className="flex flex-col gap-3 w-full font-medium [&>li]:pt-2">
      {menuTrail.map(
        (style, index) =>
          index > 0 &&
          index < menuItems.length - 1 &&
          index !== 3 && ( // Podcast Episodes temporarily hidden
            <animated.li
              key={menuItems[index]}
              style={style}
              data-index={index}
              className={
                "flex group gap-2 border-b border-current w-full justify-between items-center pointer-events-auto cursor-pointer pr-2"
              }
              onClick={handleMenuItemClick}
            >
              <span
                className={cn(
                  "group-hover:translate-x-1 transition-all duration-300",
                  selectedIndex === index &&
                    "group-hover:translate-x-2 translate-x-2 "
                )}
              >
                {index === 1
                  ? formatAuthorNames(book?.authors || [])
                  : menuItems[index]}
              </span>
              <span
                className={cn(
                  "opacity-0 group-hover:rotate-90 group-hover:opacity-100 transition-all duration-300",
                  selectedIndex === index &&
                    "opacity-100 rotate-135 group-hover:rotate-135 "
                )}
              >
                <PlusIcon className="w-2.5 h-2.5" />
              </span>
            </animated.li>
          )
      )}
    </ul>
  );
}
