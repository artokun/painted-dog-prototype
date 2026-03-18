"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LoadingVideoProps {
  src: string;
  className?: string;
}

export function LoadingVideo({ src, className }: LoadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const attemptPlay = () => {
      const playPromise = video.play();

      if (playPromise) {
        playPromise.catch(() => {
          // Safari can reject the first autoplay attempt before metadata is ready.
        });
      }
    };

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x-webkit-airplay", "deny");

    const handleReady = () => {
      attemptPlay();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        attemptPlay();
      }
    };

    video.addEventListener("loadedmetadata", handleReady);
    video.addEventListener("canplay", handleReady);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("touchstart", handleReady, {
      once: true,
      passive: true,
    });
    window.addEventListener("click", handleReady, { once: true });

    video.load();
    attemptPlay();

    return () => {
      video.removeEventListener("loadedmetadata", handleReady);
      video.removeEventListener("canplay", handleReady);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("touchstart", handleReady);
      window.removeEventListener("click", handleReady);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={cn(
        "w-[300px] h-[300px] object-cover rounded-lg mix-blend-multiply",
        className
      )}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
    />
  );
}
