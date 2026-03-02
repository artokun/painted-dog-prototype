import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Middle, Foreground } from "./components/ClientComponents";

export const metadata: Metadata = {
  title: "Painted Dog",
  description:
    "Painted Dog Press is an independent book publisher of fiction and non-fiction. We develop and nurture quality literature and provide writers with a publishing house that continually fosters and markets their work.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="stylesheet" href="https://use.typekit.net/uww8yjt.css" />
        <Script
          id="cookieyes"
          strategy="beforeInteractive"
          src={`https://cdn-cookieyes.com/client_data/de39bc09360b5ee9ef438483/script.js`}
        ></Script>
      </head>
      <body className={`font-fields antialiased overflow-hidden h-dvh w-full`}>
        <main className="h-dvh w-screen relative">
          <Middle />
          {children}
          <Foreground />
          <div
            id="loading-overlay"
            className={cn(
              "absolute opacity-100 transition-opacity duration-600",
              "inset-0 bg-white flex items-center justify-center z-50"
            )}
          >
            <video
              id="loading-video"
              className="w-[300px] h-[300px] object-cover rounded-lg"
              src={`/loading/${Math.floor(Math.random() * 3) + 1}.mp4`}
              autoPlay
              loop
              muted
              playsInline
            />

            {/* <Image src="/logo-dog.png" alt="Logo" width={200} height={200} /> */}
          </div>
        </main>
        <div id="portal-root" />
        <Script id="prevent-navigation" strategy="afterInteractive">
          {`
            // Check if we're in the browser environment
            if (typeof window !== 'undefined') {
              // Prevent browser back/forward navigation
              let preventNavigation = false;
              
              // Prevent back/forward browser navigation
              function preventBrowserNavigation(e) {
                if (preventNavigation) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }
              
              // Set up navigation prevention when page loads
              document.addEventListener('DOMContentLoaded', function() {
              preventNavigation = true;
              
              // Prevent gesture navigation
              document.addEventListener('gesturestart', preventBrowserNavigation, { passive: false });
              document.addEventListener('gesturechange', preventBrowserNavigation, { passive: false });
              document.addEventListener('gestureend', preventBrowserNavigation, { passive: false });
              
              // Prevent swipe navigation on touch devices
              let startX = 0;
              let startY = 0;
              
              document.addEventListener('touchstart', function(e) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
              }, { passive: true });
              
              document.addEventListener('touchmove', function(e) {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const diffX = Math.abs(currentX - startX);
                const diffY = Math.abs(currentY - startY);
                
                // If horizontal swipe is detected near screen edges, prevent it
                if (diffX > diffY && (startX < 50 || startX > window.innerWidth - 50)) {
                  e.preventDefault();
                }
              }, { passive: false });
              
              // Override browser history navigation
              let isNavigating = false;
              window.addEventListener('popstate', function(e) {
                if (!isNavigating) {
                  isNavigating = true;
                  window.history.pushState(null, '', window.location.href);
                  setTimeout(() => { isNavigating = false; }, 100);
                }
              });
              
              // Push initial state to prevent immediate back navigation
              window.history.pushState(null, '', window.location.href);
              });
            }
          `}
        </Script>
        <GoogleAnalytics gaId="G-HT9PYQDS94" />
      </body>
    </html>
  );
}
