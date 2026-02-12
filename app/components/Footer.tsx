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
import { openCart } from "@/app/store/cartUIStore"; // Import open function

export const Footer = () => {
  const { focusedBookId } = useSnapshot(bookStore);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const someBookIsFocused = focusedBookId !== null;

  const SocialLinks = () => {
    return (
      <div className="flex gap-2 mt-2 md:mt-0 mx-auto md:ml-auto justify-center items-center [&>button]:hover:text-gray-500 [&>button]:transition-colors [&svg]:w-full [&svg]:h-full">
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
    );
  };

  return (
    <section
      className={cn(
        "flex w-full items-center justify-center pointer-events-none px-4 pt-20 pb-4 md:pt-15 md:pb-6 transition-opacity duration-300 md:px-20",
        someBookIsFocused && !isMobile ? "opacity-0" : "opacity-100"
      )}
    >
      <footer className="relative min-h-[216px] bg-[#F9F6F0] overflow-hidden pointer-events-auto p-[5px] text-black w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 border border-black p-1 w-full h-full min-h-[206px]">
          {/* logo column */}
          <div className="flex row-span-2  p-4 md:flex-row md:row-span-2 justify-center gap-6 md:gap-10 items-center relative border-2 md:border-r border-b-0 md:border-b-2 border-black flex-1 h-full min-h-[196px] ">
            <div className="flex flex-col w-full justify-between h-full">
              <ThreeLink href="/">
                <Image
                  src="/logo-dog-footer.png"
                  alt="Logo"
                  width={320}
                  height={149}
                  className="w-full h-full object-contain min-w-[120px] min-h-[120px]"
                />
              </ThreeLink>

              <div className="flex justify-between">
                <ThreeLink
                  className="text-xl font-medium"
                  noUnderline
                  href="/login"
                >
                  Login
                </ThreeLink>
                <ThreeLink
                  className="text-xl font-medium"
                  noUnderline
                  href="/dashboard"
                >
                  Account
                </ThreeLink>
                <button
                  className="text-xl font-medium hover:cursor-pointer"
                  onClick={openCart}
                >
                  Cart
                </button>
              </div>
            </div>
          </div>

          {/* center column */}
          <div className="flex flex-col px-4 py-8  justify-center items-center gap-4 [&>button]:transition-colors flex-1 border-l-2 border-t md:border-l-0 border-r-2 md:border-t-2 md:border-b md:border-r border-black h-full md:min-h-[196px]">
            <div className="menu-section flex flex-col">
              <ThreeLink
                className="text-[32px] font-bold"
                noUnderline
                href="/contact"
              >
                For Readers
              </ThreeLink>
              <ThreeLink href="/newsletter" noUnderline>
                Newsletter
              </ThreeLink>
              <ThreeLink href="/" noUnderline>
                Browse Stack
              </ThreeLink>
            </div>
          </div>

          {/* right column */}
          <div className="flex flex-col px-4 py-8 justify-center items-center gap-4 [&>button]:transition-colors flex-1 border-t border-b border-r-2 border-l-2 border-black h-full md:md:border-t-2 md:border-l-0 md:min-h-[196px]">
            <div className="menu-section flex flex-col">
              <ThreeLink
                className="text-[32px] font-bold"
                noUnderline
                href="/contact"
              >
                For Writers
              </ThreeLink>
              <ThreeLink href="/legal" noUnderline>
                Submissions
              </ThreeLink>
            </div>
          </div>

          {/* Bottom navigation - spans 2 columns  */}
          <div className="flex flex-col md:flex-row p-6 col-auto md:col-span-2 border-l-2 border-b-2 border-r-2 md:border-l-0">
            <div className="flex gap-2 menu-section">
              <ThreeLink
                className="text-[28px] font-semibold"
                href="/about"
                noUnderline
              >
                About
              </ThreeLink>
              <ThreeLink
                className="text-[28px] font-semibold"
                href="/contact"
                noUnderline
              >
                Contact
              </ThreeLink>
              <ThreeLink
                className="text-[28px] font-semibold"
                href="/news"
                noUnderline
              >
                News
              </ThreeLink>
            </div>

            <div className="flex gap-2 menu-section-legal mx-auto md:ml-auto!">
              <ThreeLink className="text-xl" href="/legal" noUnderline>
                Privacy
              </ThreeLink>
              <ThreeLink className="text-xl" href="/legal" noUnderline>
                Legal
              </ThreeLink>
            </div>

            <SocialLinks />
          </div>
        </div>
      </footer>
    </section>
  );
};
