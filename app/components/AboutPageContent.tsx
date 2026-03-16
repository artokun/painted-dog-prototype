"use client";

import { cn } from "@/lib/utils";
import { useState, useCallback, useRef, useEffect } from "react";
import { Footer } from "./Footer";
import type { AboutContent } from "@/lib/about";
import { PersonCardSimple } from "./PersonCardSimple";
import { PersonCard } from "./PersonCard";
import gsap from "gsap";
import { PageOverlay } from "./PageOverlay";

enum Tab {
  About = "about",
  WhoWeAre = "whoweare",
  Friends = "friends",
}

export const AboutPageContent = ({
  visible,
  aboutContent,
}: {
  visible: boolean;
  aboutContent: AboutContent | null;
}) => {
  const [tab, setTab] = useState(Tab.About);

  const handleVisibilityChange = useCallback(
    (vis: boolean, wasVis: boolean) => {
      if (vis && !wasVis) {
        setTab(Tab.About);
      }
    },
    []
  );

  return (
    <PageOverlay
      visible={visible}
      id="about-page-scroll-container"
      direction="right"
      className="bg-[#e7d7bf]"
      onVisibilityChange={handleVisibilityChange}
    >
      {(showContent) =>
        showContent ? (
          <>
            <div
              className={cn(
                "flex flex-col items-center justify-center max-w-[1320px] mx-auto w-full mt-20 xl:px-2 px-6"
              )}
            >
              <AboutPage
                tab={tab}
                setTab={setTab}
                aboutContent={aboutContent}
              />
            </div>
            <Footer />
          </>
        ) : null
      }
    </PageOverlay>
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
      className="text-5xl xl:text-7xl flex text-left cursor-pointer relative"
      onClick={onClick}
    >
      <span className={cn(!active && "underline opacity-30")}>{children}</span>
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
    <div className="flex flex-col gap-20">
      <ul className="flex flex-col gap-2">
        <TabButton active={tab === Tab.About} onClick={() => setTab(Tab.About)}>
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
      <p className="text-[28px] xl:text-[38px] font-fields">
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
  const contentTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top of content
    if (contentTopRef.current) {
      contentTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Animate paper section sliding up from below on mount and tab change
    if (paperRef.current) {
      gsap.fromTo(
        paperRef.current,
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }
  }, [tab]);

  const getTabDescription = () => {
    switch (tab) {
      case Tab.About:
        return "Painted Dog Press is an independent book publisher of fiction and non-fiction.";
      case Tab.WhoWeAre:
        return "Meet the people behind Painted Dog Press.";
      case Tab.Friends:
        return "Our partners and friends in the literary world.";
      default:
        return "";
    }
  };

  return (
    <div className="xl:py-20 py-12 w-full">
      <div className="xl:hidden w-full py-12 flex flex-col gap-2">
        <MobileTabSelector tab={tab} setTab={setTab} />
      </div>
      <div className="flex gap-6 w-full xl:py-20">
        <aside className="hidden xl:flex flex-col items-start gap-4 flex-0 min-w-[300px]  xl:min-w-[500px] h-fit sticky top-20">
          <ul className="flex flex-col gap-2 pb-14">
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
              Who We Are
            </TabButton>
            <TabButton
              active={tab === Tab.Friends}
              onClick={() => setTab(Tab.Friends)}
            >
              Friends
            </TabButton>
          </ul>
          <p className="text-[28px] xl:text-[38px] font-fields">
            {getTabDescription()}
          </p>
        </aside>

        <section
          ref={paperRef}
          className="flex-1 torn-paper bg-[#f9f6f0] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] mt-0 xl:mt-[230px] px-6 prose prose-lg max-w-none"
        >
          <div ref={contentTopRef} className="absolute -top-20" />

          {tab === Tab.About && (
            <div>
              {(aboutContent?.aboutTab && aboutContent.aboutTab.length > 0 && (
                <div className="space-y-8">
                  {aboutContent.aboutTab.map((person, index) => (
                    <PersonCardSimple key={index} person={person} />
                  ))}
                </div>
              )) || <p>No content available</p>}
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
    </div>
  );
};
