"use client";

import { cn } from "@/lib/utils";
import { animated, useSpring } from "@react-spring/web";
import { useState, useRef, useEffect } from "react";
import { globalStore } from "../store/globalStore";
import { Footer } from "./Footer";
import { getAllProducts } from "@/lib/shopify";

enum Tab {
  About = "about",
  WhoWeAre = "whoweare",
  Friends = "friends",
}

export const AboutPageContent = ({ visible }: { visible: boolean }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [tab, setTab] = useState(Tab.About);
  const [showContent, setShowContent] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset success state when component becomes visible after being hidden
  useEffect(() => {
    if (visible && !wasVisible && isSuccess) {
      setIsSuccess(false);
      setTab(Tab.About); // Also reset to general tab
    }
    setWasVisible(visible);
  }, [visible, wasVisible, isSuccess]);

  // Track scroll position and smooth scroll to top on navigation away
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (visible) {
        globalStore.overlayScrollPosition = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll);

    // Smooth scroll to top when navigating away
    if (!visible && container.scrollTop > 0) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      globalStore.overlayScrollPosition = 0;
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [visible]);

  const style = useSpring({
    opacity: visible ? 1 : 0,
    x: visible ? 0 : 100,
    delay: visible ? 300 : 50,
    onStart: () => {
      setShowContent(true);
    },
    onRest: () => {
      setShowContent(visible);
    },
  });

  return (
    <animated.div
      ref={containerRef}
      id="contact-page-scroll-container"
      style={style}
      className={cn(
        "bg-[#e7d7bf] absolute inset-0 h-dvh w-dvw text-black z-10 overflow-y-auto overflow-x-hidden",
        visible && "pointer-events-auto"
      )}
    >
      {showContent && (
        <>
          <div
            className={cn(
              "flex flex-col items-center justify-center max-w-11/12 mx-auto w-full mt-20 md:px-2 px-8"
            )}
          >
            <AboutPage tab={tab} setTab={setTab} />
          </div>
          <Footer />
        </>
      )}
    </animated.div>
  );
};

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <li
      className=" text-7xl flex text-left  cursor-pointer relative"
      onClick={onClick}
    >
      <span
        className={cn(
          "transition-all duration-300 hover:-translate-x-1",
          active && "underline font-medium hover:-translate-x-7"
        )}
      >
        {children}
      </span>
      {/* <ArrowRight
        className={cn(
          "h-6 w-6 absolute right-0 transition-all -translate-x-2 duration-100 delay-0 opacity-0",
          active && "translate-x-0 opacity-100 delay-100 duration-300"
        )}
      /> */}
    </li>
  );
};

const FormSelector = ({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormSelect = (selectedTab: Tab) => {
    setTab(selectedTab);
    setIsOpen(false);
  };

  const styles = useSpring({
    height: isOpen ? "auto" : 48, // 48px for the main button (py-3 = 12px top + 12px bottom + ~24px content)
    config: { duration: 150 },
  });

  const getDisplayText = () => {
    return tab === Tab.About ? "About" : "Who We Are";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <animated.div
        style={styles}
        className={cn(
          "flex flex-col rounded-sm border border-black font-medium cursor-pointer transition-all duration-100 overflow-hidden",
          "hover:-translate-y-0.5 hover:shadow-md",
          isOpen && "shadow-md -translate-y-0.5"
        )}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-left"
        >
          <span>{getDisplayText()}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={cn(
              "transition-transform duration-300 ease-in-out",
              isOpen && "rotate-180"
            )}
          >
            <path fill="none" stroke="black" strokeWidth="1" d="M3 5l3 3 3-3" />
          </svg>
        </div>
        {isOpen && (
          <div className="flex flex-col font-normal w-full border-t border-black">
            <button
              onClick={() => handleFormSelect(Tab.About)}
              className={cn(
                "w-full px-4 py-2 text-left cursor-pointer hover:font-medium active:text-neutral-900",
                tab === Tab.About && "font-medium"
              )}
            >
              About
            </button>
            <button
              onClick={() => handleFormSelect(Tab.WhoWeAre)}
              className={cn(
                "w-full px-4 py-2 text-left cursor-pointer hover:font-medium active:text-neutral-900",
                tab === Tab.About && "font-medium"
              )}
            >
              Who We Are
            </button>
            <button
              onClick={() => handleFormSelect(Tab.WhoWeAre)}
              className={cn(
                "w-full px-4 py-2 text-left cursor-pointer hover:font-medium active:text-neutral-900",
                tab === Tab.About && "font-medium"
              )}
            >
              Who We Are
            </button>
          </div>
        )}
      </animated.div>
    </div>
  );
};

const AboutPage = ({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
}) => {
  return (
    <div className="md:py-20 py-12 w-full">
      {/* <h1 className="text-center md:text-5xl text-4xl font-medium md:py-20 py-12">
        Contact
      </h1> */}

      <div className="md:hidden w-full py-12 flex flex-col gap-2">
        <label className="text-md font-medium">Select form</label>
        <FormSelector tab={tab} setTab={setTab} />
        <p className="mx-auto max-w-md text-center md:leading-loose px-2">
          Whether you are an aspiring writer, a reviewer, an influencer, or you
          have discovered interesting reviews of our works in publications or on
          BookTok we&apos;d love to hear from you. Select a form type to begin.
        </p>
      </div>
      <div className="flex gap-[100px] w-full md:py-20">
        <aside className="hidden md:flex flex-col items-start gap-4 flex-0 min-w-[500px] pr-8 h-fit sticky top-20">
          {/* <h3 className="text-3xl">Form Type</h3> */}
          <ul className="flex flex-col gap-2">
            <TabButton
              active={tab === Tab.About}
              onClick={() => setTab(Tab.About)}
            >
              About
            </TabButton>
            <TabButton
              active={tab === Tab.WhoWeAre}
              onClick={() => setTab(Tab.WhoWeAre)}
            >
              Who we are
            </TabButton>
            <TabButton
              active={tab === Tab.Friends}
              onClick={() => setTab(Tab.Friends)}
            >
              Friends
            </TabButton>
          </ul>
        </aside>
        <section className="flex-1 bg-white mt-16 p-8">
          {tab === Tab.About && <>About Us</>}
          {tab === Tab.WhoWeAre && "WhoWeAre"}
          {tab === Tab.Friends && "Friends"}
        </section>
      </div>
      <div className="border-b border-black w-full max-w-[400px] mx-auto h-px pt-20 md:pt-3" />
    </div>
  );
};
