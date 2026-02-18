"use client";

import { useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { globalStore } from "../store/globalStore";
import { useRouter } from "next/navigation";
import { login } from "@/app/store/authStore";
import {
  createCustomer,
  loginCustomer,
  getCustomer,
} from "@/lib/shopify-client";
import Image from "next/image";
import { openForgotPassword } from "../store/forgotPasswordStore";
import { useForm } from "react-hook-form";

interface FormData {
  firstName?: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPageComponent = ({ visible }: { visible: boolean }) => {
  const [showContent, setShowContent] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login flow
        const loginResult = await loginCustomer(data.email, data.password);

        if (!loginResult.success) {
          setError(loginResult.errors?.[0]?.message || "Login failed");
          setLoading(false);
          return;
        }

        const customerResult = await getCustomer(loginResult.accessToken);

        if (!customerResult.success) {
          setError("Failed to fetch customer details");
          setLoading(false);
          return;
        }

        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: {
              email: customerResult.customer.email,
              firstName: customerResult.customer.firstName,
              customerId: customerResult.customer.id,
            },
            accessToken: loginResult.accessToken,
            rememberMe: data.rememberMe,
          }),
        });

        login(
          {
            email: customerResult.customer.email,
            firstName: customerResult.customer.firstName,
            customerId: customerResult.customer.id,
          },
          loginResult.accessToken
        );

        router.push("/");
      } else {
        // Signup flow
        const result = await createCustomer(
          data.email,
          data.password,
          data.firstName
        );

        if (!result.success) {
          setError(result.errors?.[0]?.message || "Signup failed");
          setLoading(false);
          return;
        }

        const loginResult = await loginCustomer(data.email, data.password);

        if (!loginResult.success) {
          setError("Account created! Please login.");
          setIsLogin(true);
          setLoading(false);
          return;
        }

        const customerResult = await getCustomer(loginResult.accessToken);

        if (!customerResult.success) {
          setError("Account created! Please login.");
          setIsLogin(true);
          setLoading(false);
          return;
        }

        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: {
              email: customerResult.customer.email,
              firstName: customerResult.customer.firstName,
              customerId: customerResult.customer.id,
            },
            accessToken: loginResult.accessToken,
            rememberMe: data.rememberMe,
          }),
        });

        login(
          {
            email: customerResult.customer.email,
            firstName: customerResult.customer.firstName,
            customerId: customerResult.customer.id,
          },
          loginResult.accessToken
        );

        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      hasAutoScrolled.current = false;
    }
  }, [visible]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (visible) {
        globalStore.overlayScrollPosition = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll);

    if (!visible && container.scrollTop > 0) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      globalStore.overlayScrollPosition = 0;
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [visible]);

  // Reset form when switching between login/signup
  useEffect(() => {
    reset();
    setError("");
  }, [isLogin, reset]);

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
          {isLogin
            ? "Enter your email address and password, then login using a button below."
            : "Create your account by filling in the details below."}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max">
          {/* SignUp Only Fields */}
          {!isLogin && (
            <>
              <div className="border-b border-black pb-1">
                <label className="flex gap-1 items-center">
                  <span>First Name</span>
                  <input
                    placeholder="Enter first name"
                    className="border-black py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 placeholder:text-end text-right bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent] text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40 scroll-m-0 border-b-0"
                    type="text"
                    {...register("firstName", {
                      required: isLogin ? false : "First name is required",
                      minLength: {
                        value: 2,
                        message: "First name must be at least 2 characters",
                      },
                      pattern: {
                        value: /^[a-zA-ZÀ-ÿĀ-žА-я\s\-']+$/,
                        message:
                          "First name can only contain letters, spaces, hyphens, and apostrophes",
                      },
                    })}
                  />
                </label>
                {errors.firstName && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.firstName.message}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Shared Fields */}
          <div className="border-b border-black pb-1">
            <label className="flex gap-1 items-center">
              <span>Email address</span>
              <input
                type="email"
                placeholder="Enter email address"
                className="border-black py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 placeholder:text-end text-right bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent] text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40 scroll-m-0 border-b-0"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
            </label>
            {errors.email && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="border-b border-black pb-1">
            <label className="flex gap-1 items-center">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                className="border-black py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 placeholder:text-end text-right bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent] text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40 scroll-m-0 border-b-0"
                {...register("password", {
                  required: "Password is required",
                  minLength: isLogin
                    ? undefined
                    : {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                  validate: isLogin
                    ? undefined
                    : {
                        hasLetter: (value) =>
                          /[A-Za-z]/.test(value) ||
                          "Password must contain at least one letter",
                        hasNumber: (value) =>
                          /[0-9]/.test(value) ||
                          "Password must contain at least one number",
                      },
                })}
              />
            </label>
            {errors.password && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.password.message}
              </span>
            )}
            {!errors.password && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters, at least one letter and one number
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer accent-[#1A1A1A]"
                  {...register("rememberMe")}
                />
                <span className="text-sm">Remember me (30 days)</span>
              </label>

              <button
                type="button"
                onClick={openForgotPassword}
                className="text-sm text-[#1A1A1A] underline hover:opacity-70 transition-opacity"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)] text-base font-medium mt-4 px-6 py-4 text-[#1A1A1A] border-[#1A1A1A] rounded hover:bg-white transition-colors disabled:bg-[#F2EFE9] disabled:opacity-50 disabled:hover:cursor-not-allowed outline -outline-offset-1 outline-Ink"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>

          <div className="w-full text-center py-1 relative ">
            <p className="after:top-[50%] after:bg-[#000000] after:absolute after:right-8 after:w-[25%] after:h-px after:bg-red after:content-[''] before:top-[50%] before:absolute before:left-8 before:w-[25%] before:h-px before:content-[''] before:bg-[#000000]">
              or
            </p>
          </div>

          {isLogin ? (
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className="flex items-center gap-2 justify-center px-3 py-2 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100 hover:-translate-y-0.5 hover:shadow-md active:bg-[#F2EFE9] bg-transparent text-black w-full"
            >
              Sign Up <img src="/login-arrow.svg" alt="login arrow" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="flex items-center gap-2 justify-center px-3 py-2 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100 hover:-translate-y-0.5 hover:shadow-md active:bg-[#F2EFE9] bg-transparent text-black w-full"
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
