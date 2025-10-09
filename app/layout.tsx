import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AuthGate from "./components/AuthGate";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Painted Dog",
  description: "A book stacking visualization",
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
      </head>
      <body className={`font-fields antialiased overflow-hidden h-dvh w-full`}>
        <main className="h-dvh w-screen relative">
          <AuthGate>{children}</AuthGate>
          <div
            id="loading-overlay"
            className={cn(
              "absolute opacity-100 transition-opacity duration-600",
              "inset-0 bg-[#2F2F2F] flex items-center justify-center z-50"
            )}
          >
            <Image src="/logo-dog.png" alt="Logo" width={200} height={200} />
          </div>
        </main>
        <div id="portal-root" />
        <Script id="prevent-navigation" strategy="beforeInteractive">
          {`
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
          `}
        </Script>
      </body>
    </html>
  );
}
