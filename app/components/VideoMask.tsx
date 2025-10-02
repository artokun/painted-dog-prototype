"use client";

import { useEffect, useRef, useState } from "react";

interface VideoMaskProps {
  videoSrc: string;
  maskSrc: string;
  alphaSrc?: string;
  alphaWebmSrc?: string;
  fallbackImage?: string;
  className?: string;
  width?: number;
  height?: number;
}

export const VideoMask = ({
  videoSrc,
  maskSrc,
  alphaSrc,
  alphaWebmSrc,
  fallbackImage,
  className = "",
  width = 800,
  height = 800,
}: VideoMaskProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maskRef = useRef<HTMLVideoElement>(null);
  const alphaVideoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>(0);
  const [videoFormat, setVideoFormat] = useState<"hevc" | "webm" | "canvas" | null>(null);

  useEffect(() => {
    // Detect Safari (doesn't support WebM alpha even though it can play WebM)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMacOS = /Macintosh/.test(navigator.userAgent);

    console.log("Browser detection:", {
      isSafari,
      isIOS,
      isMacOS,
      userAgent: navigator.userAgent,
    });

    // Safari macOS: show static image (canvas is buggy)
    // iOS: use canvas (works fine on mobile)
    // Chrome/Firefox/Edge: use WebM with alpha
    if (isMacOS && isSafari && fallbackImage) {
      console.log("Using static image (Safari macOS)");
      setVideoFormat("canvas"); // Will show image instead
    } else if (isIOS || !alphaWebmSrc) {
      console.log("Using canvas fallback (iOS or no WebM source)");
      setVideoFormat("canvas");
    } else {
      console.log("Using WebM VP9 with alpha transparency");
      setVideoFormat("webm");
    }
  }, [alphaWebmSrc, fallbackImage]);

  useEffect(() => {
    if (videoFormat === null) return;
    if (videoFormat !== "canvas") return; // Use native alpha video

    // Check if we should show static image instead (Safari macOS)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMacOS = /Macintosh/.test(navigator.userAgent);

    if (isMacOS && isSafari && fallbackImage) {
      console.log("Canvas effect: Skipping (showing static image instead)");
      return; // Don't setup canvas, we're showing static image
    }

    console.log("Canvas effect: Setting up canvas masking");

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const mask = maskRef.current;

    if (!canvas || !video || !mask) {
      console.error("Canvas effect: Missing elements", { canvas: !!canvas, video: !!video, mask: !!mask });
      return;
    }

    console.log("Canvas effect: All elements found");

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      console.error("Canvas effect: Could not get 2D context");
      return;
    }

    console.log("Canvas effect: Got 2D context, setting up draw loop");

    let frameCount = 0;
    const draw = () => {
      if (video.paused || video.ended || mask.paused || mask.ended) {
        return;
      }

      frameCount++;
      if (frameCount === 1) {
        console.log("Canvas: First frame drawn");
      }

      // Clear canvas to transparent
      ctx.clearRect(0, 0, width, height);

      // Draw the video frame
      ctx.drawImage(video, 0, 0, width, height);

      // Get the video pixel data
      const frame = ctx.getImageData(0, 0, width, height);

      // Draw the mask to get its pixel data
      ctx.drawImage(mask, 0, 0, width, height);
      const maskData = ctx.getImageData(0, 0, width, height);

      // Apply the mask: use mask's brightness as alpha channel
      for (let i = 0; i < frame.data.length; i += 4) {
        // Use the inverted mask: White (255) = dog, Black (0) = background
        // We want: dog = opaque (255), background = transparent (0)
        // So we use the inverted mask value directly (it's already inverted)
        frame.data[i + 3] = maskData.data[i];
      }

      // Put the masked frame back
      ctx.putImageData(frame, 0, 0);

      animationRef.current = requestAnimationFrame(draw);
    };

    // Sync video playback times
    const syncVideos = () => {
      if (Math.abs(video.currentTime - mask.currentTime) > 0.1) {
        mask.currentTime = video.currentTime;
      }
    };

    // Handle loop restart to keep videos in perfect sync
    const handleLoop = () => {
      video.currentTime = 0;
      mask.currentTime = 0;
      void video.play();
      void mask.play();
    };

    // Start drawing when both videos are ready and playing
    const startDrawing = () => {
      if (
        video.readyState >= video.HAVE_CURRENT_DATA &&
        mask.readyState >= mask.HAVE_CURRENT_DATA
      ) {
        console.log("Canvas: Starting to draw video with mask");
        syncVideos();
        draw();
      }
    };

    // Also try to start when videos load metadata
    const tryStart = () => {
      console.log("Canvas: tryStart called", {
        videoReady: video.readyState,
        maskReady: mask.readyState,
        videoPaused: video.paused,
        maskPaused: mask.paused,
      });
      if (
        video.readyState >= video.HAVE_CURRENT_DATA &&
        mask.readyState >= mask.HAVE_CURRENT_DATA &&
        !video.paused &&
        !mask.paused
      ) {
        console.log("Canvas: Both videos ready, starting draw loop");
        draw();
      }
    };

    console.log("Canvas: Adding event listeners");
    video.addEventListener("play", startDrawing);
    video.addEventListener("loadeddata", tryStart);
    video.addEventListener("canplay", tryStart);
    video.addEventListener("timeupdate", syncVideos);
    video.addEventListener("ended", handleLoop);
    mask.addEventListener("play", startDrawing);
    mask.addEventListener("loadeddata", tryStart);
    mask.addEventListener("canplay", tryStart);

    console.log("Canvas: Initial video states", {
      videoReady: video.readyState,
      maskReady: mask.readyState,
      videoPaused: video.paused,
      maskPaused: mask.paused,
    });

    // Set playback rate to 50% for smoother sync
    video.playbackRate = 0.5;
    mask.playbackRate = 0.5;

    return () => {
      console.log("Canvas: Cleaning up");
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      video.removeEventListener("play", startDrawing);
      video.removeEventListener("loadeddata", tryStart);
      video.removeEventListener("canplay", tryStart);
      video.removeEventListener("timeupdate", syncVideos);
      video.removeEventListener("ended", handleLoop);
      mask.removeEventListener("play", startDrawing);
      mask.removeEventListener("loadeddata", tryStart);
      mask.removeEventListener("canplay", tryStart);
    };
  }, [videoSrc, maskSrc, width, height, videoFormat, fallbackImage]);

  // Try WebM VP9 with alpha first (Chrome/Firefox/Edge support it, Safari will fallback)
  if (videoFormat === "webm" && alphaWebmSrc) {
    return (
      <video
        ref={alphaVideoRef}
        src={alphaWebmSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={className}
        style={{ width: "100%", height: "100%" }}
        onError={() => {
          console.log("WebM failed to load, falling back to canvas masking");
          setVideoFormat("canvas");
        }}
        onLoadedData={() => console.log("WebM video loaded successfully with alpha transparency")}
      />
    );
  }

  // Check if we should show static image (Safari macOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  const isMacOS = /Macintosh/.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );

  // Safari macOS: show static image instead
  if (videoFormat === "canvas" && isMacOS && isSafari && fallbackImage) {
    return (
      <img
        src={fallbackImage}
        alt="Logo"
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    );
  }

  // Fallback to canvas masking (iOS and other non-WebM browsers)
  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
      />
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        height={height}
        width={width}
        muted
        playsInline
        className="absolute h-0 w-0 opacity-0 top-0 left-0 -z-20 pointer-events-none"
      />
      <video
        ref={maskRef}
        src={maskSrc}
        autoPlay
        height={height}
        width={width}
        muted
        playsInline
        className="absolute h-0 w-0 opacity-0 top-0 left-0 -z-20 pointer-events-none"
      />
    </>
  );
};
