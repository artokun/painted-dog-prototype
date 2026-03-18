"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface NewsParallaxHeaderProps {
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
}

export function NewsParallaxHeader({
  title,
  excerpt,
  coverImageUrl,
}: NewsParallaxHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const excerptRef = useRef<HTMLDivElement>(null);
  const emdashRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Only run on desktop
    if (window.innerWidth < 768) return;

    const setupAnimations = () => {
      if (!imgElementRef.current || !imageRef.current || !containerRef.current) return;

      const imageHeight = imgElementRef.current.offsetHeight || 0;
      const threshold = imageHeight / 2;

      // Find the scrolling container
      let scrollContainer: HTMLElement | null = null;
      let element: HTMLElement | null = containerRef.current.parentElement;
      while (element) {
        const overflow = window.getComputedStyle(element).overflowY;
        if (overflow === "auto" || overflow === "scroll") {
          scrollContainer = element;
          break;
        }
        element = element.parentElement;
      }

      if (!scrollContainer) return;

      const ctx = gsap.context(() => {
        // Find the summary section content to calculate target positions
        const summarySection = document.querySelector('article > div:first-child > div');
        
        if (summarySection && imageRef.current && titleRef.current && excerptRef.current) {
          const imageTop = imageRef.current.offsetTop;
          const titleTop = titleRef.current.offsetTop;
          const excerptBottom = excerptRef.current.offsetTop + excerptRef.current.offsetHeight;
          const summaryTop = (summarySection as HTMLElement).offsetTop;
          const summaryBottom = summaryTop + (summarySection as HTMLElement).offsetHeight;
          const imageHeight = imgElementRef.current!.offsetHeight;
          
          // Phase 1: Text scrolls down to image (image stays at top)
          const phase1Distance = imageTop - titleTop;
          
          // Phase 2: Text and image scroll together until excerpt bottom is 102px above summary
          const targetExcerptBottom = summaryTop - 102;
          const currentExcerptBottom = excerptBottom + phase1Distance;
          const phase2Distance = targetExcerptBottom - currentExcerptBottom;
          
          // Phase 3: Image continues alone until its bottom aligns with summary bottom
          const currentImageBottom = imageTop + phase2Distance + imageHeight;
          const phase3Distance = summaryBottom - currentImageBottom;
          
          const textElements = [titleRef.current, excerptRef.current, emdashRef.current].filter(Boolean);
          
          // Phase 1: Text scrolls to image (image stays at top)
          gsap.fromTo(textElements, 
            { y: 0 },
            {
              y: phase1Distance,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top+=40",
                end: `+=${phase1Distance}`,
                scrub: 0.05,
                scroller: scrollContainer,
                invalidateOnRefresh: true,
              },
            }
          );
          
          // Phase 2: Text and image scroll together
          gsap.fromTo(textElements,
            { y: phase1Distance },
            {
              y: phase1Distance + phase2Distance,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: containerRef.current,
                start: `top+=${phase1Distance} top+=40`,
                end: `+=${phase2Distance}`,
                scrub: 0.05,
                scroller: scrollContainer,
                invalidateOnRefresh: true,
              },
            }
          );
          gsap.fromTo(imageRef.current,
            { y: 0 },
            {
              y: phase2Distance,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: `top+=${phase1Distance} top+=40`,
                end: `+=${phase2Distance}`,
                scrub: 0.05,
                scroller: scrollContainer,
                invalidateOnRefresh: true,
              },
            }
          );
          // Phase 3: Image continues alone
          gsap.fromTo(imageRef.current,
            { y: phase2Distance },
            {
              y: phase2Distance + phase3Distance,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: containerRef.current,
                start: `top+=${phase1Distance + phase2Distance} top+=40`,
                end: `+=${phase3Distance}`,
                scrub: 0.05,
                scroller: scrollContainer,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      }, containerRef);

      return ctx;
    };

    // Wait for image to load
    if (imgElementRef.current) {
      if (imgElementRef.current.complete) {
        const ctx = setupAnimations();
        return () => ctx?.revert();
      } else {
        const handleLoad = () => {
          const ctx = setupAnimations();
          return () => ctx?.revert();
        };
        imgElementRef.current.addEventListener("load", handleLoad);
        return () => {
          imgElementRef.current?.removeEventListener("load", handleLoad);
        };
      }
    }
  }, [coverImageUrl]);

  return (
    <header ref={containerRef} className="mt-10 md:mt-28">
      <h1
        ref={titleRef}
        className="text-4xl md:text-5xl font-fields leading-tight font-medium md:col-span-4 grid grid-cols-1 md:grid-cols-8"
      >
        <span className="md:col-span-4">{title}</span>
      </h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-8 gap-6 items-start">
        {excerpt ? (
          <>
            <div
              ref={emdashRef}
              className="hidden md:flex md:col-span-1 md:col-start-1 justify-end text-xl md:text-2xl text-black"
            >
              —
            </div>
            <div
              ref={excerptRef}
              className="text-xl md:text-2xl text-black leading-relaxed md:col-span-3 md:col-start-2 flex gap-3 md:gap-0"
            >
              <span className="shrink-0 md:hidden">—</span>
              <span>{excerpt}</span>
            </div>
          </>
        ) : null}

        {coverImageUrl ? (
          <figure
            ref={imageRef}
            className="relative w-full md:col-span-4 md:col-start-5 md:pl-6 flex justify-center"
          >
            <Image
              ref={imgElementRef}
              src={coverImageUrl}
              alt=""
              width={1200}
              height={464}
              className="w-full h-auto shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
            />
          </figure>
        ) : null}
      </div>
    </header>
  );
}
