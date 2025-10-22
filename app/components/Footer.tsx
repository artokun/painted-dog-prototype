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
import { useMediaQuery } from "usehooks-ts";

export const Footer = () => {
  const { focusedBookId } = useSnapshot(bookStore);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const someBookIsFocused = focusedBookId !== null;

  return (
    <section
      className={cn(
        "flex w-full items-center justify-center pointer-events-none px-4 pt-20 pb-4 md:pt-15 md:pb-6 transition-opacity duration-300 md:px-20",
        someBookIsFocused && !isMobile ? "opacity-0" : "opacity-100"
      )}
    >
      <footer className="relative min-h-[216px] bg-[#F9F6F0] overflow-hidden pointer-events-auto p-[5px] text-black w-full max-w-7xl">
        <div className="flex flex-col md:flex-row border border-black p-1 w-full h-full min-h-[206px]">
          <div className="flex flex-col p-4 md:flex-row justify-center gap-6 md:gap-10 items-center relative border-2 md:border-r-1 border-b-0 md:border-b-2 border-black flex-1 h-full min-h-[196px]">
            <ThreeLink href="/">
              <Image
                src="/logo-dog-footer.png"
                alt="Logo"
                width={260}
                height={120}
                className="w-full h-full object-contain min-w-[120px] min-h-[120px]"
              />
            </ThreeLink>
          </div>
          <div className="flex flex-col px-4 py-8 justify-center items-center gap-4 [&>button]:transition-colors flex-1 border-2 md:border-l-0 border-t-1 md:border-t-2 border-black h-full md:min-h-[196px]">
            <ThreeLink
              className="text-xl font-medium"
              noUnderline
              href="/contact"
            >
              Contact
            </ThreeLink>
            <ThreeLink href="/legal" noUnderline>
              Privacy &amp; Legal Policy
            </ThreeLink>
            <div className="flex gap-2 justify-center items-center [&>button]:hover:text-gray-500 [&>button]:transition-colors [&svg]:w-full [&svg]:h-full">
              <ThreeLink
                href="https://www.facebook.com/profile.php?id=61581186237434"
                className="w-4.5 h-4.5"
                target="_blank"
              >
                <Facebook />
              </ThreeLink>
              <ThreeLink
                href="https://www.instagram.com/painted_dog_press/"
                className="w-4.5 h-4.5"
                target="_blank"
              >
                <Instagram />
              </ThreeLink>
              <ThreeLink
                href="https://www.youtube.com/@PaintedDogPress"
                className="w-4.5 h-4.5"
                target="_blank"
              >
                <YouTube />
              </ThreeLink>
              <ThreeLink
                href="https://www.tiktok.com/@painteddogpress?lang=en"
                className="w-4.5 h-4.5"
                target="_blank"
              >
                <TikTok />
              </ThreeLink>
              <ThreeLink
                href="https://bsky.app/profile/painteddogpress.bsky.social"
                className="w-4.5 h-4.5"
                target="_blank"
              >
                <Bluesky />
              </ThreeLink>
              <ThreeLink
                href="https://x.com/painteddogpress"
                className="w-4.5 h-4.5"
                target="_blank"
              >
                <XTwitter />
              </ThreeLink>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};
