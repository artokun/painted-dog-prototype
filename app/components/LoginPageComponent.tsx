"use client";

import { useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { globalStore } from "../store/globalStore";
import { useRouter } from "next/navigation";
import { login } from "@/app/store/authStore";

export const LoginPageComponent = ({ visible }: { visible: boolean }) => {
  const [showContent, setShowContent] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  // Reset auto-scroll flag when component becomes invisible
  useEffect(() => {
    if (!visible) {
      hasAutoScrolled.current = false;
    }
  }, [visible]);

  // Track scroll position and smooth scroll to top on navigation away
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (visible) {
        globalStore.overlayScrollPosition = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll);

    // Smooth scroll to top when navigating away
    if (!visible && container.scrollTop > 0) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      globalStore.overlayScrollPosition = 0;
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [visible]);

  const style = useSpring({
    opacity: visible ? 1 : 0,
    x: visible ? 0 : -100,
    delay: visible ? 300 : 0,
    onStart: () => {
      setShowContent(true);
    },
    onRest: () => {
      setShowContent(visible);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: We'll add Shopify API calls here
    console.log("Form submitted:", { email, password, firstName, lastName });

    // For now, just test the login
    login({ email, firstName, lastName }, "temp-token");

    // Redirect to home or back to cart
    router.push("/");
  };

  return (
    <animated.div
      style={style}
      ref={scrollContainerRef}
      id="login-page-scroll-container"
      className={cn(
        "absolute inset-0 h-dvh w-dvw pointer-events-none text-black z-10 overflow-y-auto overflow-x-hidden",
        visible && "pointer-events-auto"
      )}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isLogin ? "Login" : "Sign Up"}
      </h1>

      {/* Toggle between Login/Signup */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 ${isLogin ? "border-b-2 border-black font-bold" : "text-gray-500"}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 ${!isLogin ? "border-b-2 border-black font-bold" : "text-gray-500"}`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
    </animated.div>
  );
};
