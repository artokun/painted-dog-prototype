"use client";

import { useEffect, useRef } from "react";
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
        // Animate title and excerpt - they move with scroll until threshold
        gsap.to([titleRef.current, excerptRef.current], {
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

        // Animate image - starts moving after threshold
        const summarySection = document.querySelector('article > div:first-child');
        if (summarySection && imageRef.current) {
          const imageTop = imageRef.current.offsetTop;
          const summaryTop = (summarySection as HTMLElement).offsetTop;
          const distance = summaryTop - imageTop + 20;

          gsap.to(imageRef.current, {
            y: distance,
            ease: "none",
            scrollTrigger: {
              trigger: imageRef.current,
              start: `top top+=40`,
              end: `+=${distance}`,
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
    <header ref={containerRef} className="mt-10">
      <h1
        ref={titleRef}
        className="text-4xl md:text-5xl font-fields font-semibold leading-tight md:w-1/2"
      >
        {title}
      </h1>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {excerpt ? (
          <div
            ref={excerptRef}
            className="text-xl md:text-2xl text-black leading-relaxed md:w-4/5 md:ml-auto flex gap-3"
          >
            <span className="shrink-0">—</span>
            <span>{excerpt}</span>
          </div>
        ) : null}

        {coverImageUrl ? (
          <figure ref={imageRef}>
            <img
              ref={imgElementRef}
              src={coverImageUrl}
              alt=""
              className="w-full h-auto max-h-[400px] object-cover rounded-sm border border-black/15"
              loading="lazy"
            />
          </figure>
        ) : null}
      </div>
    </header>
  );
}
