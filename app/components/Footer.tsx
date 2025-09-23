import Image from "next/image";
import {
  Instagram,
  Facebook,
  YouTube,
  TikTok,
  XTwitter,
  Bluesky,
} from "./icons/social";
import { ThreeLink } from "./ThreeLink";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { cn } from "@/lib/utils";

export const Footer = () => {
  const { focusedBookId } = useSnapshot(bookStore);
  const someBookIsFocused = focusedBookId !== null;

  return (
    <section
      className={cn(
        "flex flex-col items-center justify-end relative w-dvw h-[50dvh] top-[25dvh] pointer-events-none p-6 transition-opacity duration-300",
        someBookIsFocused ? "opacity-0" : "opacity-100"
      )}
    >
      <footer className="relative flex flex-col justify-center items-center h-[256px] bg-[#F9F6F0] overflow-hidden pointer-events-auto p-[5px] text-black w-full max-w-7xl">
        <div className="flex justify-center items-center border border-black p-1 w-full h-full">
          <div className="flex justify-center gap-13 items-center relative border-2 border-r-1 border-black flex-1 h-full">
            <Image src="/logo-dog.png" alt="Logo" width={160} height={160} />
            <div className="flex flex-col justify-center gap-6 items-center">
              <Image
                src="/logo-dog-stacked.png"
                alt="Logo"
                width={233}
                height={104}
              />
              <div className="flex gap-3 justify-center items-center [&>button]:hover:text-gray-500 [&>button]:transition-colors [&svg]:w-full [&svg]:h-full">
                <ThreeLink href="#" className="w-7 h-7">
                  <Facebook />
                </ThreeLink>
                <ThreeLink href="#" className="w-7 h-7">
                  <Instagram />
                </ThreeLink>
                <ThreeLink href="#" className="w-7 h-7">
                  <YouTube />
                </ThreeLink>
                <ThreeLink href="#" className="w-7 h-7">
                  <TikTok />
                </ThreeLink>
                <ThreeLink href="#" className="w-7 h-7">
                  <Bluesky />
                </ThreeLink>
                <ThreeLink href="#" className="w-7 h-7">
                  <XTwitter />
                </ThreeLink>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-6 [&>button]:transition-colors flex-1 border-2 border-l-0 border-black h-full">
            <ThreeLink className="text-2xl font-medium" href="/contact">
              Contact
            </ThreeLink>
            <ThreeLink href="/legal" className="text-lg">
              Privacy &amp; Legal Policy
            </ThreeLink>
          </div>
        </div>
      </footer>
    </section>
  );
};
