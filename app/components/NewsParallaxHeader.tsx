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
        // Animate title, excerpt and emdash together to half image height
        const textElements = [titleRef.current, excerptRef.current, emdashRef.current].filter(Boolean);
        gsap.to(textElements, {
          y: threshold,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top+=40",
            end: `+=${threshold}`,
            scrub: 0.05,
            scroller: scrollContainer,
            invalidateOnRefresh: true,
          },
        });

        // Animate image - moves to align with summary section
        const summarySection = document.querySelector('article > div:first-child');
        if (summarySection && imageRef.current) {
          const imageTop = imageRef.current.offsetTop;
          const summaryTop = (summarySection as HTMLElement).offsetTop;
          const distance = summaryTop - imageTop - threshold;

          gsap.to(imageRef.current, {
            y: distance,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top+=40",
              end: `+=${Math.abs(distance) * 1.5}`,
              scrub: 0.05,
              scroller: scrollContainer,
              invalidateOnRefresh: true,
            },
          });
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
            className="relative w-full md:col-span-4 md:col-start-5 flex justify-center"
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
