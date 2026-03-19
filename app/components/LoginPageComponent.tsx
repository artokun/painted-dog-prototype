"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { globalStore } from "../store/globalStore";
import { useRouter } from "next/navigation";
import { authStore, login } from "@/app/store/authStore";
import Image from "next/image";
import { openForgotPassword } from "../store/forgotPasswordStore";
import { useForm } from "react-hook-form";
import { useSnapshot } from "valtio";
import { cartUIStore, setProceedToCheckout } from "../store/cartUIStore";
import { cartStore } from "../store/cartStore";
import { createCart } from "@/lib/shopify-client";
import { PageOverlay } from "./PageOverlay";
import { Eye, EyeClosed } from "lucide-react";

interface FormData {
  firstName?: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPageComponent = ({ visible }: { visible: boolean }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cartUi = useSnapshot(cartUIStore);
  const cart = useSnapshot(cartStore);
  const global = useSnapshot(globalStore);
  const [showPassword, setShowPassword] = useState(false);

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
        // login
        const response = await fetch("/api/shopify/customer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            rememberMe: data.rememberMe,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.errors?.[0]?.message || "Login failed");
          setLoading(false);
          return;
        }

        login(
          {
            email: result.customer.email,
            firstName: result.customer.firstName,
            customerId: result.customer.id,
          },
          result.accessToken
        );

        setLoginSuccess(true);

        if (cartUi.proceedToCheckoutAfterLogin) {
          setSuccessMessage("Proceeding to checkout..");
          setProceedToCheckout(false);

          const lineItems = cart.items.map((item) => ({
            merchandiseId: item.id,
            quantity: item.quantity,
          }));

          const shopifyCart = await createCart(lineItems, result.accessToken);

          if (shopifyCart?.checkoutUrl) {
            window.location.href = shopifyCart.checkoutUrl;
          }
        } else {
          const returnTo =
            global.previousRoute === "/login" ? "/" : global.previousRoute;
          setSuccessMessage("Redirecting...");
          setTimeout(() => {
            globalStore.currentRoute = returnTo;
          }, 500);
        }
      } else {
        // Single API call - create + login + session
        const response = await fetch("/api/shopify/customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            rememberMe: data.rememberMe,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.errors?.[0]?.message || "Signup failed");
          setLoading(false);
          return;
        }

        // If no accessToken, account created but auto-login failed
        if (!result.accessToken) {
          setError(result.message || "Account created! Please login.");
          setIsLogin(true);
          setLoading(false);
          return;
        }

        // Update client state (session already created server-side)
        login(
          {
            email: result.customer.email,
            firstName: result.customer.firstName,
            customerId: result.customer.id,
          },
          result.accessToken
        );

        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChange = useCallback(
    (vis: boolean, wasVis: boolean) => {
      if (vis && !wasVis) {
        if (loginSuccess) return;

        if (authStore.isLoggedIn) {
          globalStore.currentRoute = "/dashboard";
          return;
        }

        setLoading(false);
        setLoginSuccess(false);
        setSuccessMessage("");
        setError("");
        setIsLogin(true);
        reset();
      }
    },
    []
  );
  // Reset form when switching between login/signup
  useEffect(() => {
    reset();
    setError("");
  }, [isLogin, reset]);

  return (
    <PageOverlay
      visible={visible}
      id="login-page-scroll-container"
      direction="left"
      className="pt-16 flex items-center justify-center px-4 lg:px-0 bg-[url(/bg-noise.svg)] bg-cover bg-center"
      onVisibilityChange={handleVisibilityChange}
    >
      <div
        className={`pd_login-wrapper top-40 md:top-10 lg:top-0 scale-none  w-full  max-w-[464px] bg-[#F9F6F0] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] p-6 rotate-0 filter xl:-rotate-1 xl:scale-[.70] relative after:absolute after:-bottom-[15px] after:left-0 after:h-4 after:w-full after:bg-[radial-gradient(circle_at_10px_-4px,#F9F6F0_12px,_transparent_13px)] after:bg-[length:20px_20px] before:bg-[length:20px_20px] before:bg-[radial-gradient(circle_at_10px_-4px,#F9F6F0_12px,_transparent_13px)] before:absolute before:-top-[15px] before:left-0 before:h-4 before:w-full before:rotate-180`}
      >
        <div className="flex justify-between gap-4">
          <p className="font-semibold">Account</p>
          <Image
            src={"/logo-dog-stacked.png"}
            width={87}
            height={37}
            alt="Painted Dog"
          />
        </div>

        <h1 className="text-[3rem] leading-[120%] lg:text-[4.5rem] py-5 font-semibold text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h1>
        <p className="text-center pb-4 text-[#1A1A1A]">
          {isLogin
            ? "Enter your email and password, then login using the button below."
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
                    className="border-black text-[15px] md:text-base py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 placeholder:text-end text-right bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent] text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40 scroll-m-0 border-b-0"
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
            <label className="flex text-[15px] md:text-base gap-1 items-center">
              <span>Email address</span>
              <input
                type="email"
                placeholder="Enter email address"
                className="border-black py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 placeholder:text-[15px] md:placeholder:text-base placeholder:text-end text-right bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent] text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40 scroll-m-0 border-b-0"
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
            <label className="flex text-[15px] md:text-base gap-1 items-center">
              <span>Password</span>
              <input
                type={showPassword ? "text" : "password"}
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
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="pl-2 text-[#1A1A1A] opacity-50 hover:opacity-100 transition-opacity focus:outline"
              >
                {showPassword ? <Eye /> : <EyeClosed />}
              </button>
            </label>
            {errors.password && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          {isLogin && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-sm md:text-base text-[#1A1A1A] underline hover:opacity-70 transition-opacity"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || loginSuccess}
            className="w-full bg-[#FF] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)] text-base font-medium mt-4 px-6 py-4 text-[#1A1A1A] border-[#1A1A1A] rounded hover:bg-white transition-colors disabled:bg-[#F2EFE9] disabled:opacity-50 disabled:hover:cursor-not-allowed outline -outline-offset-1 outline-Ink"
          >
            {loading
              ? "Please wait..."
              : loginSuccess
                ? successMessage
                : isLogin
                  ? "Login"
                  : "Sign Up"}
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
    </PageOverlay>
  );
};
