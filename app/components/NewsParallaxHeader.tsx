"use client";

import { useEffect, useRef, useState } from "react";

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
  const headerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageHeight, setImageHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [targetPosition, setTargetPosition] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => {
      window.removeEventListener("resize", checkIsDesktop);
    };
  }, []);

  useEffect(() => {
    const calculatePositions = () => {
      if (imageRef.current && imageContainerRef.current) {
        // Update image height
        setImageHeight(imageRef.current.offsetHeight);
        
        // Find the summary copy section
        const summarySection = document.querySelector('article > div:first-child');
        if (summarySection && headerRef.current) {
          // Get positions relative to the header
          const headerTop = headerRef.current.offsetTop;
          const imageTop = imageContainerRef.current.offsetTop;
          const summaryTop = (summarySection as HTMLElement).offsetTop;
          
          // Calculate how far the image needs to travel
          // Slight offset so it sits nicely next to summary
          const distance = summaryTop - imageTop + 20;
          setTargetPosition(distance);
        }
      }
    };

    // Calculate on image load
    if (imageRef.current) {
      if (imageRef.current.complete) {
        calculatePositions();
      } else {
        imageRef.current.addEventListener("load", calculatePositions);
      }
    }

    // Recalculate on resize
    window.addEventListener("resize", calculatePositions);
    
    // Initial calculation with delay for DOM to settle
    const timer = setTimeout(calculatePositions, 100);

    return () => {
      window.removeEventListener("resize", calculatePositions);
      clearTimeout(timer);
      if (imageRef.current) {
        imageRef.current.removeEventListener("load", calculatePositions);
      }
    };
  }, [coverImageUrl]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;
      setScrollY(scrollTop);
    };

    // Find the scrolling container - it should be an ancestor with overflow-y-auto
    let scrollContainer: HTMLElement | null = null;
    if (headerRef.current) {
      let element: HTMLElement | null = headerRef.current.parentElement;
      while (element) {
        const overflow = window.getComputedStyle(element).overflowY;
        if (overflow === "auto" || overflow === "scroll") {
          scrollContainer = element;
          break;
        }
        element = element.parentElement;
      }
    }

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer?.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Calculate the threshold (half of image height)
  const threshold = imageHeight / 2;

  // Calculate the transform for title and excerpt
  // They stay fixed (translate with scroll) until threshold is reached
  const getTransform = () => {
    if (!isDesktop) return 'translateY(0px)';
    
    if (scrollY < threshold) {
      return `translateY(${scrollY}px)`;
    }
    return `translateY(${threshold}px)`;
  };

  // Calculate the transform for the image
  // The image scrolls down to meet the summary copy section
  const getImageTransform = () => {
    if (!isDesktop) return 'translateY(0px)';
    
    if (scrollY <= threshold) {
      return `translateY(0px)`;
    }
    // After threshold, start moving the image down at 1:1 ratio for smoothness
    const progress = scrollY - threshold;
    const imageTranslate = Math.min(progress, targetPosition);
    return `translateY(${imageTranslate}px)`;
  };

  return (
    <header ref={headerRef} className="mt-10">
      <h1
        className="text-4xl md:text-5xl font-fields font-semibold leading-tight md:w-1/2"
        style={{
          transform: getTransform(),
          transition: "transform 0.05s linear",
        }}
      >
        {title}
      </h1>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {excerpt ? (
          <div
            className="text-xl md:text-2xl text-black leading-relaxed md:w-4/5 md:ml-auto flex gap-3"
            style={{
              transform: getTransform(),
              transition: "transform 0.05s linear",
            }}
          >
            <span className="shrink-0">—</span>
            <span>{excerpt}</span>
          </div>
        ) : null}

        {coverImageUrl ? (
          <figure
            ref={imageContainerRef}
            style={{
              transform: getImageTransform(),
              transition: "transform 0.05s linear",
            }}
          >
            <img
              ref={imageRef}
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
