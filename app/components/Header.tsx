import Link from "next/link";

export const Header = () => {
  return (
    <div className="fixed top-0 left-0 w-full flex items-center justify-center z-20 text-black font-[500] border-b-1 border-gray-200 backdrop-blur-sm pointer-events-auto">
      <div className="flex items-center justify-between max-w-screen-lg mx-auto gap-4 px-4 h-18 w-full">
        <div className="flex gap-2 items-center flex-1">
          <Link href="/reviews">Reviews</Link>
          <span>&middot;</span>
          <Link href="/newsletter">Newsletter</Link>
        </div>
        <h1 className="text-4xl flex justify-center whitespace-nowrap items-center text-center font-fields text-black font-[600] flex-1">
          painted dog
        </h1>
        <div className="gap-2 items-center flex-1 flex justify-end">
          <Link href="/podcast">Podcast</Link>
          <button className="text-gray-800">Menu</button>
        </div>
      </div>
    </div>
  );
};
