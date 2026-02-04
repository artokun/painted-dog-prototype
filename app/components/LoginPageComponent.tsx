"use client";

import { useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { globalStore } from "../store/globalStore";
import { useRouter } from "next/navigation";
import { login } from "@/app/store/authStore";
import { createCustomer, loginCustomer, getCustomer } from "@/lib/shopify";
import Image from "next/image";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Login and get access token
      const loginResult = await loginCustomer(email, password);

      if (!loginResult.success) {
        setError(loginResult.errors?.[0]?.message || "Login failed");
        setLoading(false);
        return;
      }

      // Step 2: Get customer details
      const customerResult = await getCustomer(loginResult.accessToken);

      if (!customerResult.success) {
        setError("Failed to fetch customer details");
        setLoading(false);
        return;
      }

      // Step 3: Save to auth store
      login(
        {
          email: customerResult.customer.email,
          firstName: customerResult.customer.firstName,
          lastName: customerResult.customer.lastName,
          customerId: customerResult.customer.id,
        },
        loginResult.accessToken
      );

      // Step 4: Redirect
      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Create customer
      const result = await createCustomer(email, password, firstName, lastName);

      if (!result.success) {
        setError(result.errors?.[0]?.message || "Signup failed");
        setLoading(false);
        return;
      }

      // Step 2: Auto-login after signup
      const loginResult = await loginCustomer(email, password);

      if (!loginResult.success) {
        setError("Account created! Please login.");
        setIsLogin(true); // Switch to login tab
        setLoading(false);
        return;
      }

      // Step 3: Get customer details
      const customerResult = await getCustomer(loginResult.accessToken);

      if (!customerResult.success) {
        setError("Account created! Please login.");
        setIsLogin(true);
        setLoading(false);
        return;
      }

      // Step 4: Save to auth store
      login(
        {
          email: customerResult.customer.email,
          firstName: customerResult.customer.firstName,
          lastName: customerResult.customer.lastName,
          customerId: customerResult.customer.id,
        },
        loginResult.accessToken
      );

      // Step 5: Redirect
      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isLogin ? handleLogin : handleSignup;
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

  return (
    <animated.div
      style={style}
      ref={scrollContainerRef}
      id="login-page-scroll-container"
      className={cn(
        "absolute flex items-center justify-center inset-0 h-dvh w-dvw pt-0 pointer-events-none text-black z-10 overflow-y-auto overflow-x-hidden bg-[#f6ead6]",
        visible && "pointer-events-auto"
      )}
    >
      <div className="pd_login-wrapper w-[464px] bg-white p-6 -rotate-1 scale-[.99]">
        {/* header items */}
        <div className="flex justify-between gap-4">
          <p className="font-bold">Library & Account</p>
          <Image
            src={"/logo-dog-stacked.png"}
            width={87}
            height={37}
            alt="Painted Dog"
          />
        </div>

        <h1 className="text-[62px] font-bold text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h1>
        <p className="text-center">
          Enter your email address, then login using a button below.
        </p>
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 max">
          {/* Login */}
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
            disabled={loading}
            className="w-full bg-black text-white px-3 h-9 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>

          {isLogin ? (
            <button
              onClick={() => setIsLogin(false)}
              className={
                "flex items-center gap-2 justify-center px-3 h-9 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100 hover:translate-y-[-2px] hover:shadow-md active:bg-[#F2EFE9] bg-transparent text-black w-full"
              }
            >
              Sign Up
            </button>
          ) : (
            <button
              onClick={() => setIsLogin(true)}
              className={
                "flex items-center gap-2 justify-center px-3 h-9 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100 hover:translate-y-[-2px] hover:shadow-md active:bg-[#F2EFE9] bg-transparent text-black w-full"
              }
            >
              Login
            </button>
          )}

          <h2 className="text-[32px] font-bold text-center pb-6">
            A community <br />
            for book-lovers.
          </h2>
        </form>
      </div>
    </animated.div>
  );
};
