"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SubstackEmbedProps {
  src: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  title?: string;
}

export const SubstackEmbed = ({ 
  src, 
  width = "480", 
  height = "150", 
  className,
  title = "Newsletter Signup"
}: SubstackEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Loading newsletter signup...</div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-sm border border-red-200">
          <div className="text-red-600 text-sm">Failed to load newsletter form</div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={src}
        width={width}
        height={height}
        style={{
          border: '1px solid #EEE',
          background: 'white',
          borderRadius: '4px',
          display: hasError ? 'none' : 'block'
        }}
        frameBorder="0"
        scrolling="no"
        title={title}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      />
    </div>
  );
};