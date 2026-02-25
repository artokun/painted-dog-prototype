"use client";

import { useSnapshot } from "valtio";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  cartStore,
  getTotalPrice,
  removeFromCart,
  clearCart,
} from "@/app/store/cartStore";
import { authStore } from "@/app/store/authStore";
import { createCart } from "@/lib/shopify-client";
import { globalStore } from "@/app/store/globalStore";
import { setProceedToCheckout } from "@/app/store/cartUIStore";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const cart = useSnapshot(cartStore);
  const auth = useSnapshot(authStore);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // GSAP Slide Animation
  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return;

    if (isOpen) {
      // Slide in
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        sidebarRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.4, ease: "power3.out" }
      );
    } else {
      // Slide out
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
      gsap.to(sidebarRef.current, {
        x: "100%",
        duration: 0.4,
        ease: "power3.in",
      });
    }
  }, [isOpen]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const item = cartStore.items.find((i) => i.id === id);
    if (item) {
      item.quantity = newQuantity;
    }
  };

  const handleCheckout = async () => {
    if (!auth.isLoggedIn || !auth.accessToken) {
      onClose();
      setProceedToCheckout(true);
      globalStore.currentRoute = "/login";
      return;
    }

    setIsCheckingOut(true);

    const lineItems = cart.items.map((item) => ({
      merchandiseId: item.id,
      quantity: item.quantity,
    }));

    try {
      // Pass the access token to attach customer identity
      const shopifyCart = await createCart(lineItems, auth?.accessToken);

      if (shopifyCart && shopifyCart.checkoutUrl) {
        window.location.href = shopifyCart.checkoutUrl;
      } else {
        alert("Error creating checkout. Please try again.");
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error creating checkout. Please try again.");
      setIsCheckingOut(false);
    }
  };

  // Prevent clicks inside sidebar from closing it
  const handleSidebarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="pointer-events-auto">
      {" "}
      {/* Add pointer-events-auto wrapper */}
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset bg-black/10 bg-opacity-50 z-100 opacity-0"
      />
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onClick={handleSidebarClick} // Stop propagation
        className="fixed top-0 right-0 h-full w-full z-110 md:w-[50%] lg:w-110 translate-x-full p-4"
      >
        <div className=" bg-[#F9F6F0] h-full w-full shadow-2xl z-110 flex flex-col p-1">
          <div className="border flex-1 border-black h-full relative">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-black">
              <h2 className="text-2xl font-semibold text-black">
                Added to Cart
              </h2>
              <button
                onClick={onClose}
                className="text-black hover:text-black font-bold transition-colors text-[16px] w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-start justify-center h-full text-black">
                  <p className="text-lg">Your cart is empty</p>
                  <p className="text-sm mt-2">Add some items to get started!</p>
                </div>
              ) : (
                <ul className="space-y-6">
                  {cart.items.map((item) => (
                    <li key={item.id} className=" pb-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3 flex-row">
                          <div
                            className="w-full md:w-[200px] h-[190px] bg-contain bg-top bg-no-repeat"
                            style={{ backgroundImage: `url(${item.image})` }}
                            role="img"
                            aria-label={item.title}
                          />
                          <div className="flex flex-col ">
                            <p className="text-[11px] font-regular text-black ">
                              {item.author}
                            </p>
                            <div className="flex items-start flex-row">
                              <p className="text-[13px] font-semibold md:text-lg text-black w-full md:w-3/6">
                                {item.title}
                              </p>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-xs md:text-[13px] text-red-600 hover:text-red-800 transition-colors underline w-[50px] ml-auto lg:mr-4"
                              >
                                Remove
                              </button>
                            </div>

                            <p className="text-lg md:text-[20px] text-black mt-1">
                              R{item.price.toFixed(2)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border gap-1 border-gray-300 rounded">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="w-[35px] h-[35px] bg-white hover:bg-gray-100 transition-colors text-black border "
                                >
                                  −
                                </button>
                                <span className="flex items-center justify-center w-[35px] h-[35px] bg-white text-center font-medium border text-black">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-[35px] h-[35px] bg-white hover:bg-gray-100 transition-colors text-black border"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* <p className="text-black">{JSON.stringify(item)}</p> */}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer - Checkout Section */}
            {cart.items.length > 0 && (
              <div className="absolute bottom-0 w-full border-t border-black p-6 bg-[#F8F5EF]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[24px] font-medium text-black">
                    Total:
                  </span>
                  <span className="text-[24px] font-medium text-black">
                    R{getTotalPrice().toFixed(2)}
                  </span>
                </div>

                {/* {!auth.isLoggedIn && (
                  <p className="text-sm text-gray-600 mb-3 text-center">
                    Please login to checkout
                  </p>
                )} */}

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className={`w-full border text-black py-3 rounded hover:bg-white cursor-pointer disabled:bg-black disabled:text-white transition-colors font-medium mb-3 ${auth.isLoggedIn ? "bg-white" : "grayscale"}`}
                >
                  {isCheckingOut
                    ? "Loading..."
                    : auth.isLoggedIn
                      ? "Proceed to Checkout"
                      : "Login to Checkout"}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full border border-black text-black py-3 rounded hover:bg-white hover:cursor-pointer transition-colors font-medium"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
