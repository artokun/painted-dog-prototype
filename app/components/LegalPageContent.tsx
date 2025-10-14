"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { ArrowRight } from "./icons/ArrowRight";
import { Footer } from "./Footer";
import { ThreeLink } from "./ThreeLink";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSnapshot } from "valtio";
import { legalStore } from "@/app/store/legalStore";
import { globalStore } from "../store/globalStore";

interface SectionAnchor {
  id: string;
  navTitle: string;
  title: string;
  content: string;
  anchor: string;
}

const SectionLink = ({
  href,
  children,
  active,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <li className="group py-2 px-8 w-full flex items-center justify-end relative cursor-pointer hover:underline">
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={cn(
        "transition-all duration-300 text-right",
        active && "font-medium"
      )}
    >
      {children}
    </a>
  </li>
);

export const LegalPageContent = ({ visible }: { visible: boolean }) => {
  const { legalPage, isLoading } = useSnapshot(legalStore);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);

  // Reset auto-scroll flag when component becomes invisible
  useEffect(() => {
    if (!visible) {
      hasAutoScrolled.current = false;
    }
  }, [visible]);

  // Track scroll position and smooth scroll to top on navigation away
  useEffect(() => {
    const container = scrollContainerRef.current;
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
    x: visible ? 0 : -100,
    delay: visible ? 300 : 0,
    onStart: () => {
      setShowContent(true);
    },
    onRest: () => {
      setShowContent(visible);

      // Auto-scroll to anchor after animation completes, only on visibility
      if (visible && !hasAutoScrolled.current && scrollContainerRef.current) {
        const hash = window.location.hash.slice(1);
        if (hash) {
          setTimeout(() => {
            const element = scrollContainerRef.current?.querySelector(
              `#${hash}`
            );
            if (element && scrollContainerRef.current) {
              const containerRect =
                scrollContainerRef.current.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              const scrollTop =
                elementRect.top -
                containerRect.top +
                scrollContainerRef.current.scrollTop;

              scrollContainerRef.current.scrollTo({
                top: scrollTop,
                behavior: "smooth",
              });
              setActiveAnchor(hash);
            }
          }, 100); // Small delay to ensure DOM is ready
        }
        hasAutoScrolled.current = true;
      }
    },
  });

  const policies = useMemo(
    () => legalPage?.policies ?? [],
    [legalPage?.policies]
  );
  const sections: SectionAnchor[] = useMemo(() => {
    return policies.map((policy, index) => {
      const anchor = policy.id || `policy-${index}`;
      return { ...policy, anchor };
    });
  }, [policies]);
  const pageTitle = legalPage?.title ?? "Privacy & Legal Policy";

  const scrollToAnchor = (anchor: string) => {
    if (!anchor || !scrollContainerRef.current) return;
    const element = scrollContainerRef.current.querySelector(`#${anchor}`);
    if (element) {
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop =
        elementRect.top -
        containerRect.top +
        scrollContainerRef.current.scrollTop;

      scrollContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  };

  const handleSectionClick = (anchor: string) => {
    setActiveAnchor(anchor);
    scrollToAnchor(anchor);
    history.replaceState(null, "", `#${anchor}`);
  };

  return (
    <animated.div
      style={style}
      ref={scrollContainerRef}
      className={cn(
        "absolute inset-0 h-dvh w-dvw pointer-events-none text-black z-10 overflow-y-auto overflow-x-hidden",
        visible && "pointer-events-auto"
      )}
    >
      {showContent && (
        <>
          <div className="flex flex-col items-center justify-center max-w-3xl mx-auto w-full mt-20 md:px-2 px-8">
            <div className="w-full flex flex-col items-center text-center gap-6 md:py-20 py-12">
              <h1 className="md:text-5xl text-4xl font-medium">{pageTitle}</h1>
            </div>
            <div className="flex gap-9 w-full pb-20">
              <aside className="hidden md:flex flex-col items-end w-full flex-0 min-w-[225px] border-r border-black h-fit sticky top-[80px]">
                <ul className="flex flex-col gap-2">
                  {sections.length > 0 ? (
                    sections.map((section) => (
                      <SectionLink
                        key={section.anchor}
                        href={`#${section.anchor}`}
                        active={activeAnchor === section.anchor}
                        onClick={() => handleSectionClick(section.anchor)}
                      >
                        {section.navTitle || section.title}
                      </SectionLink>
                    ))
                  ) : (
                    <li className="text-sm text-neutral-500">
                      {isLoading ? "Loading..." : "No policies available."}
                    </li>
                  )}
                </ul>
              </aside>
              <section className="flex-1 flex flex-col gap-8">
                {sections.length > 0 ? (
                  sections.map((section, index) => (
                    <article
                      key={section.anchor}
                      className="flex flex-col gap-4 text-left relative"
                    >
                      <a
                        href={`#${section.anchor}`}
                        id={section.anchor}
                        className="inline-block absolute -top-25 left-0 h-0"
                      />
                      <h2 className="text-xl font-medium">
                        {index + 1}. {section.title}
                      </h2>
                      <div className="flex flex-col gap-3 leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="leading-relaxed" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className={cn(
                                  "list-none pl-6 leading-tight space-y-2 relative",
                                  "[&>li]:before:content-['•'] [&>li]:before:absolute [&>li]:before:left-2.5"
                                )}
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                className="list-decimal pl-6 leading-tight space-y-2"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {section.content}
                        </ReactMarkdown>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">
                    {isLoading
                      ? "Loading policies..."
                      : "We are updating our policies. Please check back soon."}
                  </p>
                )}
              </section>
            </div>
            <div className="border-b border-black w-full max-w-[400px] mx-auto h-[1px] pb-3" />
            <div className="flex gap-[100px] w-full md:py-20 py-12">
              <aside className="hidden md:flex flex-col items-end gap-4 flex-0 min-w-[224px] pr-8 h-fit">
                <h3 className="text-3xl font-medium">Contact</h3>
              </aside>
              <section className="flex-1">
                <h3 className="text-3xl font-medium mb-6 md:hidden">Contact</h3>
                For further information or privacy-related enquiries, please
                reach out to us at{" "}
                <ThreeLink href="mailto:info@painteddog.press" target="_blank">
                  info@painteddog.press
                </ThreeLink>{" "}
                or visit our <ThreeLink href="/contact">contact page</ThreeLink>
                .
              </section>
            </div>
          </div>
          <Footer />
        </>
      )}
    </animated.div>
  );
};
