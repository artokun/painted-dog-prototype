"use client";

import Image from "next/image";
import { useState } from "react";
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
import { openCart } from "@/app/store/cartUIStore";
import SocialLinks from "./ecommerce/SocialLiniks";
import { NewsletterModal } from "./NewsletterModal";
import { authStore, logout } from "../store/authStore";

export const Footer = () => {
  const { focusedBookId } = useSnapshot(bookStore);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const someBookIsFocused = focusedBookId !== null;
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const auth = useSnapshot(authStore);

  return (
    <section
      className={cn(
        "flex w-full items-center justify-center pointer-events-none px-4 pt-20 pb-4 md:pt-15 md:pb-6 transition-opacity duration-300 md:px-20",
        someBookIsFocused && !isMobile ? "opacity-0" : "opacity-100"
      )}
    >
      <footer className="relative min-h-[216px] torn-paper  bg-[#F9F6F0] pointer-events-auto p-[5px] text-black w-full max-w-7xl">
        <div className="torn-right"></div>
        <div className="torn-bottom"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-black p-1 w-full h-full min-h-[206px]">
          {/* logo column - Full width on mobile and tablet, 1/3 on desktop */}
          <div className="flex py-6 px-10 justify-center gap-6 md:gap-10 items-center relative border-2 border-b-0 md:border-b lg:border-r-0 lg:border-b-2 border-black flex-1 h-full min-h-[196px] md:col-span-2 lg:col-span-1 lg:row-span-3">
            <div className="flex flex-col w-full justify-between h-full">
              <ThreeLink href="/">
                <Image
                  src="/logo-dog-footer.png"
                  alt="Logo"
                  width={320}
                  height={149}
                  className="w-full h-full object-cover"
                />
              </ThreeLink>

              <div className="flex justify-between">
                {auth.isLoggedIn ? (
                  <button
                    className="text-xl font-medium hover:cursor-pointer"
                    onClick={logout}
                  >
                    Log Out
                  </button>
                ) : (
                  <ThreeLink
                    className="text-xl font-medium"
                    noUnderline
                    href="/login"
                  >
                    Login
                  </ThreeLink>
                )}

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

          {/* center column - "For Readers" */}
          <div className="flex flex-col px-12 py-6 justify-start items-center gap-4 [&>button]:transition-colors flex-1 md:border-l-2 border-t md:border-t-0 border-l border-r md:border-r lg:border-l lg:border-r lg:border-t-2 border-black h-full md:min-h-[196px]">
            <div className="menu-section flex flex-col">
              <ThreeLink
                className="text-[32px] font-semibold"
                noUnderline
                href="/contact"
              >
                For Readers
              </ThreeLink>
              <button
                onClick={() => setIsNewsletterModalOpen(true)}
				className="cursor-pointer"
              >
                Newsletter
              </button>
              <ThreeLink href="/" noUnderline>
                Browse Stack
              </ThreeLink>
            </div>
          </div>

          {/* right column - "For Writers" */}
          <div className="flex flex-col  px-12 py-6 justify-start items-center gap-4 [&>button]:transition-colors flex-1 border-t md:border-l-0 md:border-t-0 border-l-2 border-r-2 lg:border-t-2 lg:border-l-0 border-black h-full md:min-h-[196px]">
            <div className="menu-section flex flex-col">
              <ThreeLink
                className="text-[32px] font-semibold"
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

          {/* Bottom navigation - Full width on all screens */}
          <div className="flex flex-col xl:flex-row px-12 py-6 md:col-span-2 lg:col-span-2 border-t border-l-2 border-b-2 border-r-2 lg:border-l">
            <div className="flex gap-4 justify-around menu-section">
              <ThreeLink
                className="md:text-[32px] text-base font-semibold"
                href="/about"
                noUnderline
              >
                About
              </ThreeLink>
              <ThreeLink
                className="md:text-[32px] text-base font-semibold"
                href="/contact"
                noUnderline
              >
                Contact
              </ThreeLink>
              <ThreeLink
                className="md:text-[32px] text-base font-semibold"
                href="/news"
                noUnderline
              >
                News
              </ThreeLink>
            </div>

            <div className="flex flex-col menu-section-legal mx-auto xl:ml-auto md:mr-0 lg:gap-8 lg:flex-row">
              <div className="flex gap-8 lg:gap-8">
                <ThreeLink className="text-base" href="/legal" noUnderline>
                  Privacy
                </ThreeLink>
                <ThreeLink className="text-base" href="/legal" noUnderline>
                  Legal
                </ThreeLink>
              </div>
              <SocialLinks />
            </div>
          </div>
        </div>
      </footer>
      <NewsletterModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
      />
    </section>
  );
};
