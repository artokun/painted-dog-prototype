"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  VideoTexture,
  LinearFilter,
  SRGBColorSpace,
  ClampToEdgeWrapping,
  Texture,
  DoubleSide,
} from "three";
import Hls from "hls.js";

interface VideoTextureOptions {
  url: string;
  bookWidth: number;
  bookHeight: number;
  scale?: number; // 0 to 1, where 1 fits the video inside the book bounds
  coverMode?: boolean; // true for cover mode, false for fit mode
  offsetX?: number; // -1 to 1, where 0 is centered
  offsetY?: number; // -1 to 1, where 0 is centered
  materialProps?: any; // Additional material properties to pass through
}

interface VideoTextureResult {
  videoGeometry: {
    args: [number, number]; // width, height for planeGeometry
  };
  videoMaterial: {
    map: VideoTexture | null;
    emissiveMap: VideoTexture | null;
    emissive: string;
    emissiveIntensity: number;
    side: typeof DoubleSide;
    toneMapped: boolean;
    [key: string]: any; // Allow additional material properties
  };
  videoPosition: {
    x: number;
    y: number;
    z: number;
  };
  isReady: boolean;
}

export function useVideoTexture(
  options: VideoTextureOptions
): VideoTextureResult {
  const {
    url,
    bookWidth,
    bookHeight,
    scale = 1.0,
    coverMode = false,
    offsetX = 0,
    offsetY = 0,
    materialProps = {},
  } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [texture, setTexture] = useState<VideoTexture | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

  // Calculate plane dimensions and position based on scaling mode
  const { planeWidth, planeHeight, positionX, positionY } = useMemo(() => {
    if (!texture || dimensions.width === 1 || dimensions.height === 1) {
      return {
        planeWidth: bookWidth,
        planeHeight: bookHeight,
        positionX: 0,
        positionY: 0,
      };
    }

    const videoAspectRatio = dimensions.width / dimensions.height;
    const bookAspectRatio = bookWidth / bookHeight;

    if (coverMode) {
      // Cover mode: Video fills the entire book, plane doesn't move
      return {
        planeWidth: bookWidth * scale,
        planeHeight: bookHeight * scale,
        positionX: 0,
        positionY: 0,
      };
    } else {
      // Fit mode: Video fits inside book bounds, maintaining aspect ratio
      let pw, ph;

      if (videoAspectRatio > bookAspectRatio) {
        // Video is wider - fit to width
        pw = bookWidth * scale;
        ph = (bookWidth / videoAspectRatio) * scale;
      } else {
        // Video is taller - fit to height
        ph = bookHeight * scale;
        pw = bookHeight * videoAspectRatio * scale;
      }

      // Calculate position based on offset
      // offsetX/Y range from -1 to 1, where 0 is centered
      const maxOffsetX = (bookWidth - pw) / 2;
      const maxOffsetY = (bookHeight - ph) / 2;
      const posX = offsetX * maxOffsetX;
      const posY = offsetY * maxOffsetY;

      return {
        planeWidth: pw,
        planeHeight: ph,
        positionX: posX,
        positionY: posY,
      };
    }
  }, [
    texture,
    dimensions,
    bookWidth,
    bookHeight,
    scale,
    coverMode,
    offsetX,
    offsetY,
  ]);

  // Apply texture transformations for cover mode
  useEffect(() => {
    if (!texture) return;

    const videoAspectRatio = dimensions.width / dimensions.height;
    const bookAspectRatio = bookWidth / bookHeight;

    if (coverMode) {
      let repeatX = 1;
      let repeatY = 1;
      let textureOffsetX = 0;
      let textureOffsetY = 0;

      if (videoAspectRatio > bookAspectRatio) {
        // Video is wider - fit height and crop width
        repeatX = bookAspectRatio / videoAspectRatio;
        // Base centering offset
        const baseCenterOffset = (1 - repeatX) / 2;
        // Apply user offset: -1 pins to left, 0 centers, 1 pins to right
        textureOffsetX = baseCenterOffset + offsetX * baseCenterOffset;
      } else {
        // Video is taller - fit width and crop height
        repeatY = videoAspectRatio / bookAspectRatio;
        // Base centering offset
        const baseCenterOffset = (1 - repeatY) / 2;
        // Apply user offset: -1 pins to top, 0 centers, 1 pins to bottom
        textureOffsetY = baseCenterOffset + offsetY * baseCenterOffset;
      }

      texture.repeat.set(repeatX, repeatY);
      texture.offset.set(textureOffsetX, textureOffsetY);
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
    } else {
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
    }

    texture.needsUpdate = true;
  }, [texture, dimensions, bookWidth, bookHeight, coverMode, offsetX, offsetY]);

  useEffect(() => {
    if (!url) return;

    // Create video element
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    videoRef.current = video;

    // Create texture from video
    const videoTexture = new VideoTexture(video);
    videoTexture.minFilter = LinearFilter;
    videoTexture.magFilter = LinearFilter;
    videoTexture.colorSpace = SRGBColorSpace;
    setTexture(videoTexture);

    // Update dimensions when metadata is loaded
    const updateDimensions = () => {
      if (video.videoWidth && video.videoHeight) {
        setDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      }
    };

    video.addEventListener("loadedmetadata", updateDimensions);

    // Check if it's an HLS stream (.m3u8) or regular video (.mp4, .webm, etc)
    const isHLS = url.includes(".m3u8");

    if (isHLS) {
      // Handle HLS streams
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((e) => {
            console.warn(
              "Auto-play failed, user interaction may be required:",
              e
            );
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error(
                  "Fatal network error encountered, trying to recover"
                );
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error(
                  "Fatal media error encountered, trying to recover"
                );
                hls.recoverMediaError();
                break;
              default:
                console.error("Fatal error, cannot recover", data);
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari which has native HLS support
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((e) => {
            console.warn(
              "Auto-play failed, user interaction may be required:",
              e
            );
          });
        });
      } else {
        console.error("HLS is not supported in this browser");
      }
    } else {
      // Handle regular video files (MP4, WebM, etc)
      video.src = url;
      video.addEventListener("loadeddata", () => {
        video.play().catch((e) => {
          console.warn(
            "Auto-play failed, user interaction may be required:",
            e
          );
        });
      });
    }

    return () => {
      // Cleanup
      video.removeEventListener("loadedmetadata", updateDimensions);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current = null;
      }
      if (videoTexture) {
        videoTexture.dispose();
      }
    };
  }, [url]);

  // Build the result object with geometry and material properties
  const result: VideoTextureResult = useMemo(() => {
    return {
      videoGeometry: {
        args: [planeWidth, planeHeight] as [number, number],
      },
      videoMaterial: {
        map: texture,
        emissiveMap: texture,
        emissive: "white",
        emissiveIntensity: 0.5,
        ...materialProps, // Spread any additional material properties
      },
      videoPosition: {
        x: positionX,
        y: positionY,
        z: 0,
      },
      isReady: !!texture && dimensions.width > 1 && dimensions.height > 1,
    };
  }, [
    texture,
    planeWidth,
    planeHeight,
    positionX,
    positionY,
    dimensions,
    materialProps,
  ]);

  return result;
}

// Keep the old function name for backward compatibility but with new signature
export const useHLSVideoTexture = useVideoTexture;
