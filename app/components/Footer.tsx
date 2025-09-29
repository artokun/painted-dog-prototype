"use client";

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
        "flex w-full items-center justify-center pointer-events-none p-6 mt-10 lg:mt-15 transition-opacity duration-300",
        someBookIsFocused ? "opacity-0" : "opacity-100"
      )}
    >
      <footer className="relative min-h-[254px] bg-[#F9F6F0] overflow-hidden pointer-events-auto p-[5px] mb-16 lg:mb-0 text-black w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row border border-black p-1 w-full h-full min-h-[244px]">
          <div className="flex flex-col p-4 lg:flex-row justify-center gap-6 lg:gap-13 items-center relative border-2 lg:border-r-1 border-b-0 lg:border-b-2 border-black flex-1 h-full min-h-[236px]">
            <ThreeLink href="/">
              <Image
                src="/logo-dog.png"
                alt="Logo"
                width={160}
                height={160}
                className="w-full h-full object-contain max-w-[160px] max-h-[160px]"
              />
            </ThreeLink>
            <div className="flex flex-col justify-center gap-6 items-center">
              <ThreeLink href="/">
                <Image
                  src="/logo-dog-stacked.png"
                  alt="Logo"
                  className="w-full h-full object-contain max-w-[233px]"
                  width={233}
                  height={104}
                />
              </ThreeLink>
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
          <div className="flex flex-col px-4 py-8 justify-center items-center gap-2 lg:gap-6 [&>button]:transition-colors flex-1 border-2 lg:border-l-0 border-t-1 lg:border-t-2 border-black h-full lg:min-h-[236px]">
            <ThreeLink
              className="text-2xl font-medium"
              noUnderline
              href="/contact"
            >
              Contact
            </ThreeLink>
            <ThreeLink
              href="/legal#privacy-data-collection"
              className="text-lg"
              noUnderline
            >
              Privacy &amp; Legal Policy
            </ThreeLink>
          </div>
        </div>
      </footer>
    </section>
  );
};
