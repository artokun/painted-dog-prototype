"use client";

import { useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { globalStore } from "../store/globalStore";
import { useRouter } from "next/navigation";
import { login } from "@/app/store/authStore";
// import { createCustomer, loginCustomer, getCustomer } from "@/lib/shopify";
import {
  createCustomer,
  loginCustomer,
  getCustomer,
} from "@/lib/shopify-client";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

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
      // console.error(err);
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
      // console.error(err);
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
      <div
        className={`pd_login-wrapper ${!isLogin && "mt-12"} w-[464px] bg-white p-6 rotate-0 filter drop-shadow-xl lg:-rotate-1 scale-[.70] relative after:absolute after:-bottom-4 after:left-0 after:h-4 after:w-full after:bg-[radial-gradient(circle_at_10px_-4px,#ffffff_12px,_transparent_13px)] after:bg-[length:20px_20px] before:bg-[length:20px_20px] before:bg-[radial-gradient(circle_at_10px_-4px,#ffffff_12px,_transparent_13px)] before:absolute before:-top-4 before:left-0 before:h-4 before:w-full before:rotate-180`}
      >
        {/* header items */}
        <div className="flex justify-between gap-4">
          <p className="font-bold">Account</p>
          <Image
            src={"/logo-dog-stacked.png"}
            width={87}
            height={37}
            alt="Painted Dog"
          />
        </div>

        <h1 className="text-[62px] py-5 font-semibold text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h1>
        <p className="text-center pb-4 text-[#1A1A1A]">
          Enter your email address, then login using a button below.
        </p>
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 max">
          {/* SignUp */}
          {!isLogin && (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={firstName}
                  placeholder=""
                  onChange={(e) => setFirstName(e.target.value)}
                  className="peer w-full border-b px-3 py-2 placeholder:text-gray-500 placeholder:text-right focus:outline-none"
                  required
                />
                <label className="absolute text-base left-0 ml-1 translate-y-1 mt-2 bg-white px-1 duration-100 ease-linear peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-black peer-focus:ml-1 peer-focus:-translate-y-6 peer-focus:px-1 peer-focus:text-sm">
                  First Name
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="peer w-full border-b px-3 py-2 placeholder:text-gray-500 placeholder:text-right focus:outline-none"
                  required
                />
                <label className="absolute text-base left-0 ml-1 translate-y-1 mt-2 bg-white px-1 duration-100 ease-linear peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-black peer-focus:ml-1 peer-focus:-translate-y-6 peer-focus:px-1 peer-focus:text-sm">
                  Last Name
                </label>
              </div>
            </>
          )}
          <div className="relative">
            <input
              type="email"
              value={email}
              placeholder="Enter email address"
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full border-b px-3 py-2 placeholder:text-gray-500 placeholder:text-right focus:outline-none"
              required
            />
            <label className="absolute text-base left-0 ml-1 translate-y-1 mt-2 bg-white px-1 duration-100 ease-linear peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-black peer-focus:ml-1 peer-focus:-translate-y-6 peer-focus:px-1 peer-focus:text-sm">
              Email your address
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full border-b px-3 py-2 placeholder:text-gray-500 placeholder:text-right focus:outline-none"
              required
            />
            <label className="absolute text-base left-0 ml-1 translate-y-1 mt-2 bg-white px-1 duration-100 ease-linear peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-black peer-focus:ml-1 peer-focus:-translate-y-6 peer-focus:px-1 peer-focus:text-sm">
              Password
            </label>
          </div>
          <button
            type="submit"
            disabled={!email || !password}
            className="w-full bg-[#FF] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)]  text-base font-medium mt-4 px-6 py-4 text-[#1A1A1A] border-[#1A1A1A] rounded hover:bg-white transition-colors disabled:bg-[#F2EFE9] disabled:opacity-50 disabled:hover:cursor-not-allowed outline -outline-offset-1 outline-Ink"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
          <div className="w-full text-center py-1 relative ">
            <p className="after:top-[50%] after:bg-[#000000] after:absolute after:right-8 after:w-[25%] after:h-px after:bg-red after:content-['*'] before:top-[50%] before:absolute before:left-8 before:w-[25%] before:h-px before:content-['*'] before:bg-[#000000]">
              or
            </p>
          </div>
          {isLogin ? (
            <button
              onClick={() => setIsLogin(false)}
              className={
                "flex items-center gap-2 justify-center px-3 py-2 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100 hover:-translate-y-0.5 hover:shadow-md active:bg-[#F2EFE9] bg-transparent text-black w-full"
              }
            >
              Sign Up <img src="/login-arrow.svg" alt="login arrow" />
            </button>
          ) : (
            <button
              onClick={() => setIsLogin(true)}
              className={
                "flex items-center gap-2 justify-center px-3 py-2 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100 hover:-translate-y-0.5 hover:shadow-md active:bg-[#F2EFE9] bg-transparent text-black w-full"
              }
            >
              Login <img src="/login-arrow.svg" alt="login arrow" />
            </button>
          )}
          <h2 className="text-[32px] leading-[41.60px] font-semibold text-center py-6">
            A community <br />
            for book-lovers.
          </h2>
        </form>
      </div>
    </animated.div>
  );
};
