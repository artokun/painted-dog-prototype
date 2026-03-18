"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LoadingVideoProps {
  src: string;
  className?: string;
}

const NON_SAFARI_BROWSERS =
  /(Chrome|CriOS|Chromium|Android|FxiOS|EdgiOS|EdgA|Edg\/|OPR|OPT|SamsungBrowser)/i;

function getSafariMajorVersion(userAgent: string) {
  if (NON_SAFARI_BROWSERS.test(userAgent) || !/Safari/i.test(userAgent)) {
    return null;
  }

  const versionMatch = userAgent.match(/Version\/(\d+)/i);
  if (versionMatch) {
    return Number(versionMatch[1]);
  }

  const iosVersionMatch = userAgent.match(/OS (\d+)_/i);
  return iosVersionMatch ? Number(iosVersionMatch[1]) : null;
}

export function LoadingVideo({ src, className }: LoadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useStaticFallback, setUseStaticFallback] = useState(false);

  useEffect(() => {
    const safariMajorVersion = getSafariMajorVersion(navigator.userAgent);
    setUseStaticFallback(
      safariMajorVersion !== null && safariMajorVersion <= 17
    );
  }, []);

  useEffect(() => {
    if (useStaticFallback) {
      return;
    }

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
  }, [src, useStaticFallback]);

  if (useStaticFallback) {
    return (
      <div
        className={cn(
          "relative w-[300px] h-[300px] rounded-lg overflow-hidden bg-[#E7D7BF]",
          className
        )}
        aria-hidden="true"
      >
        <Image
          src="/logo-dog.png"
          alt=""
          fill
          priority
          sizes="300px"
          className="object-contain p-4 mix-blend-multiply"
        />
      </div>
    );
  }

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
