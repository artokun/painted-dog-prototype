"use client";

import { cn } from "@/lib/utils";
import { animated, useSpring } from "@react-spring/web";
import { useState, useRef, useEffect } from "react";
import { globalStore } from "../store/globalStore";
import { Footer } from "./Footer";
import type { AboutContent } from "@/lib/about";
import { PersonCardSimple } from "./PersonCardSimple";
import { PersonCard } from "./PersonCard";
import gsap from "gsap";

enum Tab {
  About = "about",
  WhoWeAre = "whoweare",
  Friends = "friends",
}

export const AboutPageContent = ({ 
  visible,
  aboutContent
}: { 
  visible: boolean;
  aboutContent: AboutContent | null;
}) => {
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
            <AboutPage tab={tab} setTab={setTab} aboutContent={aboutContent} />
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
      className="text-5xl md:text-7xl flex text-left cursor-pointer relative"
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
    </li>
  );
};

const MobileTabSelector = ({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
}) => {
  const getTabDescription = () => {
    switch (tab) {
      case Tab.About:
        return "Painted Dog Press is an independent book publisher of fiction and narrative non-fiction.";
      case Tab.WhoWeAre:
        return "Meet the people behind Painted Dog Press.";
      case Tab.Friends:
        return "Our partners and friends in the literary world.";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
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
      <p className="text-base text-[38px] font-montserrat max-w-[400px]">
        {getTabDescription()}
      </p>
    </div>
  );
};

const AboutPage = ({
  tab,
  setTab,
  aboutContent,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
  aboutContent: AboutContent | null;
}) => {
  const paperRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const contentTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top of content
    if (contentTopRef.current) {
      contentTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Animate paper section sliding up from below on mount and tab change
    if (paperRef.current) {
      gsap.fromTo(
        paperRef.current,
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }

    // Animate line drawing across
    if (lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 1.2, ease: "power3.inOut", delay: 0.6 }
      );
    }
  }, [tab]);

  const getTabDescription = () => {
    switch (tab) {
      case Tab.About:
        return "Painted Dog Press is an independent book publisher of fiction and narrative non-fiction.";
      case Tab.WhoWeAre:
        return "Meet the people behind Painted Dog Press.";
      case Tab.Friends:
        return "Our partners and friends in the literary world.";
      default:
        return "";
    }
  };

  return (
    <div className="md:py-20 py-12 w-full">
      <div ref={contentTopRef} className="absolute -top-20" />
      
      <div className="md:hidden w-full py-12 flex flex-col gap-2">
        <MobileTabSelector tab={tab} setTab={setTab} />
      </div>
      <div className="flex gap-[100px] w-full md:py-20">
        <aside className="hidden md:flex flex-col items-start gap-4 flex-0 min-w-[500px] pr-8 h-fit sticky top-20">
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
          <p className="text-base font-montserrat mt-8 max-w-[400px]">
            {getTabDescription()}
          </p>
        </aside>
        <section 
          ref={paperRef}
          className="flex-1 bg-[#f9f6f0] mt-16 p-8 prose prose-lg max-w-none"
        >
          {tab === Tab.About && (
            <div>
              {aboutContent?.aboutTab && aboutContent.aboutTab.length > 0 && (
                <div className="space-y-8">
                  {aboutContent.aboutTab.map((person, index) => (
                    <PersonCardSimple key={index} person={person} />
                  ))}
                </div>
              ) || <p>No content available</p>}
            </div>
          )}
          {tab === Tab.WhoWeAre && (
            <div>
              {aboutContent?.whoWeAre && aboutContent.whoWeAre.length > 0 ? (
                <div className="space-y-8">
                  {aboutContent.whoWeAre.map((person, index) => (
                    <PersonCard key={index} person={person} />
                  ))}
                </div>
              ) : (
                <p>No content available</p>
              )}
            </div>
          )}
          {tab === Tab.Friends && (
            <div>
              {aboutContent?.friends && aboutContent.friends.length > 0 ? (
                <div className="space-y-8">
                  {aboutContent.friends.map((person, index) => (
                    <PersonCard key={index} person={person} />
                  ))}
                </div>
              ) : (
                <p>No content available</p>
              )}
            </div>
          )}
        </section>
      </div>
      <div 
        ref={lineRef}
        className="border-b border-black w-full max-w-[400px] mx-auto h-px pt-20 md:pt-3" 
      />
    </div>
  );
};
