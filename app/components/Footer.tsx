"use client";

import Image from "next/image";
import { useState } from "react";
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
        "flex w-full items-center justify-center pointer-events-none px-4 pt-20 pb-4 md:pt-15 md:pb-6 transition-opacity duration-300  md:px-[32px]",
        someBookIsFocused && !isMobile ? "opacity-0" : "opacity-100"
      )}
    >
      <footer className="relative min-h-[216px] torn-paper bg-[#F9F6F0] pointer-events-auto p-4 text-black w-full max-w-[1600px] shadow-[0_6px_14px_rgba(0,0,0,0.16)]">
        <div className="torn-right"></div>
        <div className="torn-bottom"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-black p-1 w-full h-full">
          {/* logo column - Full width on mobile and tablet, 1/3 on desktop */}
          <div className="flex py-6 px-10 justify-center gap-6 items-center relative border-3 border-b-0 md:border-b lg:border-r-0 lg:border-b-3 border-black flex-1 h-full md:col-span-2 lg:col-span-1 lg:row-span-3">
            <div className="flex flex-col w-full justify-between h-full gap-6">
              <ThreeLink className="flex h-auto md:h-[120px] " href="/">
                <Image
                  src="/logo-dog-footer.png"
                  alt="Logo"
                  width={300}
                  height={129}
                  className="w-auto h-full mx-auto object-contain"
                />
              </ThreeLink>

              <div className="flex justify-between">
                {auth.isLoggedIn ? (
                  <button
                    className="text-base pb-1 lg:text-lg font-semibold uppercase relative after:bg-black after:absolute after:h-0.5 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
                    onClick={logout}
                  >
                    Log Out
                  </button>
                ) : (
                  <ThreeLink
                    className="text-base lg:text-lg font-semibold uppercase"
                    animatedUnderline
                    href="/login"
                  >
                    Login
                  </ThreeLink>
                )}

                <ThreeLink
                  className="text-base lg:text-lg font-semibold uppercase"
                  animatedUnderline
                  href="/dashboard"
                >
                  Account
                </ThreeLink>
                <button
                  className=" lg:text-lg text-base font-semibold uppercase relative after:bg-black after:absolute after:h-0.5 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer pb-1"
                  onClick={openCart}
                >
                  Cart
                </button>
              </div>
            </div>
          </div>

          {/* center column - "For Readers" */}
          <div className="flex border-l-3 border-r-3 flex-col px-12 py-6 justify-start items-center gap-4 [&>button]:transition-colors flex-1 md:border-l-3 border-t md:border-t-0 md:border-r lg:border-l lg:border-r lg:border-t-3 border-black h-full">
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
                className="relative w-fit mx-auto after:bg-black after:absolute after:h-0.5 after:w-0 after:bottom-0.5 after:left-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
              >
                Newsletter
              </button>
            </div>
          </div>

          {/* right column - "For Writers" */}
          <div className="flex flex-col  px-12 py-6 justify-start items-center gap-4 [&>button]:transition-colors flex-1 border-t md:border-t-0 border-l-3 md:border-l-0 border-r-3 lg:border-t-3 lg:border-l-0 border-black h-full">
            <div className="menu-section flex flex-col">
              <ThreeLink
                className="text-[32px] font-semibold"
                noUnderline
                href="/contact"
              >
                For Writers
              </ThreeLink>
              <ThreeLink
                className="w-fit mx-auto"
                href="/contact"
                animatedUnderline
              >
                Submissions
              </ThreeLink>
            </div>
          </div>

          {/* Bottom navigation - Full width on all screens */}
          <div className="flex flex-col xl:flex-row px-12 py-6 md:col-span-2 lg:col-span-2 border-t border-l-3 border-b-3 border-r-3 lg:border-l">
            <div className="flex lg:flex-1 gap-4 items-end justify-around menu-section pb-2 top-0 lg:relative lg:top-[15px] ">
              <ThreeLink
                className="md:text-[32px] leading-[41px] text-base font-semibold"
                href="/about"
                animatedUnderline
              >
                About
              </ThreeLink>
              <ThreeLink
                className="md:text-[32px] leading-[41px] text-base font-semibold"
                href="/contact"
                animatedUnderline
              >
                Contact
              </ThreeLink>
              <ThreeLink
                className="md:text-[32px] leading-[41px] text-base font-semibold"
                href="/news"
                animatedUnderline
              >
                News
              </ThreeLink>
            </div>

            <div className="flex lg:flex-1 lg:justify-center gap-6 flex-col menu-section-legal mx-auto xl:ml-auto top-0 lg:relative lg:top-[15px] lg:mr-0 lg:gap-8 lg:flex-row md:mx-auto!">
              <div className="flex gap-8 lg:gap-4">
                <ThreeLink
                  className="text-base relative after:bg-black after:absolute after:h-0.5 after:w-0 after:bottom-4 after:left-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
                  href="/legal"
                  noUnderline
                >
                  Privacy
                </ThreeLink>
                <ThreeLink
                  className="text-base relative after:bg-black after:absolute after:h-0.5 after:w-0 after:bottom-4 after:left-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
                  href="/legal"
                  noUnderline
                >
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
