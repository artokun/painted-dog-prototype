import { animated, useSpring } from "@react-spring/web";
import { SortDesc as SortDescIcon } from "./icons/SortDesc";
import { SortBy as SortByIcon } from "./icons/SortBy";
import { Search } from "./icons/Search";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SortBy, SortOrder } from "@/types/book";
import { useSnapshot } from "valtio";
import { FilterKey, filterStore, FilterView } from "../store/filterStore";
import { X } from "lucide-react";
import { bookStore } from "../store/bookStore";

const FilterBarToggle = ({
  children,
  filterView,
}: {
  children?: React.ReactNode;
  filterView: FilterView;
}) => {
  const { view, isSorting, isChangingView } = useSnapshot(filterStore);

  const styles = useSpring({
    opacity: isSorting ? 0.5 : 1,
  });

  return (
    <div
      className={cn(
        "bg-[#F9F6F0] last:pr-1 first:pl-1 p-0.5 py-1 first:rounded-l-xs last:rounded-r-xs"
      )}
    >
      <animated.div
        className={cn(
          "relative flex flex-col overflow-hidden items-start font-fields border-1 border-black rounded-xs transition-colors duration-300",
          view === filterView
            ? "bg-black text-white"
            : "bg-[#F9F6F0] text-black"
        )}
        style={styles}
      >
        <div className="flex items-center justify-center gap-2 flex-nowrap">
          <button
            onClick={() => {
              if (isSorting || isChangingView) return;
              filterStore.view = filterView;
            }}
            className="flex items-center justify-center font-[500] h-12 min-w-12 p-2 cursor-pointer"
          >
            {children}
          </button>
        </div>
      </animated.div>
    </div>
  );
};

const FloatingBarButton = ({
  icon,
  options,
  children,
  filterKey,
}: {
  icon?: React.ReactNode;
  options?: { key: SortBy | SortOrder; label: string }[];
  children?: React.ReactNode;
  filterKey?: FilterKey;
}) => {
  const { open, search, isSorting, sortBy, sortOrder } =
    useSnapshot(filterStore);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const styles = useSpring(
    icon
      ? {
          width:
            open === filterKey
              ? filterKey === FilterKey.Search
                ? "250px"
                : "120px"
              : "50px",
          height: `${open === filterKey ? (options?.length ?? 0) * 32 + 50 : 50}px`,
          opacity: isSorting ? 0.5 : 1,
          delay: open === filterKey ? 0 : 0,
        }
      : {}
  );

  useEffect(() => {
    if (filterKey === FilterKey.Search && open === filterKey) {
      searchInputRef.current?.focus();
    } else {
      searchInputRef.current?.blur();
    }
  }, [filterKey, open, searchInputRef]);

  const isSelected = useCallback(
    (key: SortBy | SortOrder) => {
      return filterKey === FilterKey.SortBy
        ? sortBy === key
        : sortOrder === key;
    },
    [filterKey, sortBy, sortOrder]
  );

  return (
    <div
      className={cn(
        "bg-[#F9F6F0] last:pr-1 first:pl-1 p-0.5 py-1 first:rounded-l-xs last:rounded-r-xs",
        icon && open === filterKey && "p-1 rounded-t-xs"
      )}
    >
      <animated.div
        className="relative flex flex-col overflow-hidden items-start font-fields border-1 border-black rounded-xs"
        style={styles}
      >
        <div className="flex items-center justify-center gap-2 flex-nowrap">
          <button
            disabled={isSorting}
            onClick={() => {
              if (filterKey) {
                filterStore.open = filterKey === open ? null : filterKey;
              }
            }}
            className="flex items-center justify-center font-[500] text-black h-12 min-w-12 p-2 cursor-pointer"
          >
            {icon ? icon : children}
          </button>
          {icon && (
            <div
              className={cn(
                "font-sans text-black -ml-2 opacity-0 transition-opacity duration-300 whitespace-nowrap",
                open === filterKey && "opacity-100"
              )}
            >
              {filterKey === FilterKey.Search ? (
                <div
                  className={cn(
                    "w-full h-full opacity-0 transition-opacity duration-300 pointer-events-none",
                    open === filterKey && "opacity-100 pointer-events-auto"
                  )}
                >
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(e) => {
                      if (isSorting) return;
                      filterStore.search = e.target.value;
                    }}
                    className="w-full h-full bg-transparent border-none outline-none"
                    placeholder="Search"
                  />
                  <button
                    disabled={isSorting}
                    className={cn(
                      "absolute right-0 top-1/2 cursor-pointer p-2 transform -translate-y-1/2 opacity-0 transition-opacity duration-300 pointer-events-none",
                      search && "opacity-100 pointer-events-auto"
                    )}
                    onClick={() => {
                      if (isSorting) return;
                      filterStore.search = "";
                      filterStore.open = null;
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                children
              )}
            </div>
          )}
        </div>
        {options && (
          <div
            className={cn(
              "flex flex-col text-black font-sans font-[300] items-start transition-opacity duration-300",
              open === filterKey ? "opacity-100" : "opacity-0"
            )}
          >
            {options.map((option) => (
              <button
                disabled={isSorting}
                key={option.key}
                className={cn(
                  "px-4 py-0.5 w-full text-gray-500 hover:text-black whitespace-nowrap text-left cursor-pointer",
                  isSelected(option.key) && "text-black font-bold"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSorting) return;
                  if (filterKey) {
                    if (filterKey === FilterKey.SortBy) {
                      filterStore.sortBy = option.key as SortBy;
                    } else if (filterKey === FilterKey.SortOrder) {
                      filterStore.sortOrder = option.key as SortOrder;
                    }
                  }
                  filterStore.open = null;
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </animated.div>
    </div>
  );
};

export const FloatingBar = () => {
  const { sortOrder, sortBy, view } = useSnapshot(filterStore);
  const { focusedBookId } = useSnapshot(bookStore);

  const currentSortBy = useRef(sortBy);
  const currentSortOrder = useRef(sortOrder);
  const currentView = useRef(view);

  useEffect(() => {
    if (
      currentSortBy.current !== sortBy ||
      currentSortOrder.current !== sortOrder
    ) {
      filterStore.isSorting = true;
      currentSortBy.current = sortBy;
      currentSortOrder.current = sortOrder;
    }
    if (currentView.current !== view) {
      // filterStore.isChangingView = true;
      currentView.current = view;
    }
  }, [sortBy, sortOrder, view]);

  const styles = useSpring({
    opacity: focusedBookId ? 0 : 1,
    y: focusedBookId ? 100 : 0,
    delay: focusedBookId ? 0 : 100,
    config: {
      mass: 1,
      tension: 350,
      friction: 40,
    },
  });

  return (
    <animated.div
      style={styles}
      className={cn(
        "flex justify-center fixed bottom-4 left-0 w-full h-18 gap-2"
      )}
    >
      <div className="flex flex-row gap-4 justify-center items-end m-4 pointer-events-auto">
        <div className="p-1 flex rounded-xs items-end">
          <FilterBarToggle filterView={FilterView.Stack}>Stack</FilterBarToggle>
          <FilterBarToggle filterView={FilterView.Grid}>Grid</FilterBarToggle>
        </div>
        <div className="p-1 flex rounded-xs items-end">
          <FloatingBarButton
            icon={
              <SortDescIcon
                className={cn(
                  "transition-transform duration-300",
                  sortOrder === SortOrder.Desc ? "rotate-x-0" : "rotate-x-180"
                )}
              />
            }
            filterKey={FilterKey.SortOrder}
            options={[
              { key: SortOrder.Desc, label: "Descending" },
              { key: SortOrder.Asc, label: "Ascending" },
            ]}
          >
            Order
          </FloatingBarButton>
          <FloatingBarButton
            icon={<SortByIcon />}
            filterKey={FilterKey.SortBy}
            options={[
              { key: SortBy.Title, label: "Title" },
              { key: SortBy.Author, label: "Author" },
            ]}
          >
            Sort by
          </FloatingBarButton>
          <FloatingBarButton icon={<Search />} filterKey={FilterKey.Search} />
        </div>
      </div>
    </animated.div>
  );
};
