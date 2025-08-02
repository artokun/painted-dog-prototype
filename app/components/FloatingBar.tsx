import { SortDesc } from "./icons/SortDesc";
import { SortBy } from "./icons/SortBy";
import { Search } from "./icons/Search";

const FloatingBarButton = ({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      className={`flex items-center justify-center p-2 font-fields h-12 min-w-12 border-1 border-black text-black font-[500] rounded-xs ${
        active ? "bg-black text-white" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const FloatingBar = () => {
  return (
    <div className="flex justify-center fixed bottom-4 left-0 w-full h-18 gap-2">
      <div className="flex flex-row gap-4 justify-center items-center m-4 pointer-events-auto">
        <div className="flex p-1 items-center gap-1">
          <div className="bg-[#F9F6F0] p-1 flex gap-1 rounded-xs">
            <FloatingBarButton>Stack</FloatingBarButton>
            <FloatingBarButton>Grid</FloatingBarButton>
          </div>
        </div>
        <div className="bg-[#F9F6F0] p-1 flex gap-1 rounded-xs">
          <FloatingBarButton>
            <SortDesc />
          </FloatingBarButton>
          <FloatingBarButton>
            <SortBy />
          </FloatingBarButton>
          <FloatingBarButton>
            <Search />
          </FloatingBarButton>
        </div>
      </div>
    </div>
  );
};
