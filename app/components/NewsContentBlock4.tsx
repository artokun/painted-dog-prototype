"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";

gsap.registerPlugin(ScrollTrigger);

interface NewsContentBlock4Props {
  imageContentBlock4?: {
    fields: {
      file: { url: string };
      description?: string;
      title?: string;
    };
  };
  contentBlock4?: Document;
}

export function NewsContentBlock4({
  imageContentBlock4,
  contentBlock4,
}: NewsContentBlock4Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Only run on desktop
    if (window.innerWidth < 768) return;

    const setupAnimation = () => {
      if (!imgElementRef.current || !imageRef.current || !contentRef.current || !containerRef.current) return;

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
        // Calculate how far the image needs to travel to align bottom with content bottom
        const imageHeight = imgElementRef.current!.offsetHeight;
        const contentHeight = contentRef.current!.offsetHeight;
        // Reduce distance to keep image within the block - subtract some margin
        const distance = Math.max(0, contentHeight - imageHeight - 100);

        if (distance > 0) {
          gsap.to(imageRef.current, {
            y: distance,
            ease: "none",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top top+=40",
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
        const ctx = setupAnimation();
        return () => ctx?.revert();
      } else {
        const handleLoad = () => {
          const ctx = setupAnimation();
          return () => ctx?.revert();
        };
        imgElementRef.current.addEventListener("load", handleLoad);
        return () => {
          imgElementRef.current?.removeEventListener("load", handleLoad);
        };
      }
    }
  }, [imageContentBlock4, contentBlock4]);

  return (
    <div ref={containerRef} className="my-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {imageContentBlock4 && imageContentBlock4.fields && (
        <figure ref={imageRef} className="relative w-full">
          <Image
            ref={imgElementRef}
            src={`https:${imageContentBlock4.fields.file.url}`}
            alt={
              imageContentBlock4.fields.description ||
              imageContentBlock4.fields.title ||
              ""
            }
            width={1200}
            height={800}
            className="w-full h-auto"
            loading="lazy"
          />
          {(imageContentBlock4.fields.description ||
            imageContentBlock4.fields.title) && (
            <figcaption className="mt-2 text-sm text-black/60">
              {imageContentBlock4.fields.description ||
                imageContentBlock4.fields.title}
            </figcaption>
          )}
        </figure>
      )}

      {contentBlock4 && contentBlock4.content && (
        <div ref={contentRef} className="prose prose-lg max-w-none [&_p]:text-black/80 [&_p]:leading-relaxed [&_p]:mb-14">
          {documentToReactComponents(contentBlock4)}
        </div>
      )}
    </div>
  );
}
