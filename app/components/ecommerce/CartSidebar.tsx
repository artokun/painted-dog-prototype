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
import { X } from "lucide-react";

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
    // AUTH CHECK - Redirect using window.location instead of useRouter
    if (!auth.isLoggedIn) {
      onClose();
      window.location.href = "/login";
      return;
    }

    setIsCheckingOut(true);

    const lineItems = cart.items.map((item) => ({
      merchandiseId: item.id,
      quantity: item.quantity,
    }));

    try {
      const shopifyCart = await createCart(lineItems);

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
        className="fixed inset-0 bg-black/10 bg-opacity-50 z-100 opacity-0"
      />
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onClick={handleSidebarClick} // Stop propagation
        className="fixed top-0 right-0 h-full w-full md:w-[50%] lg:w-[30%] bg-[#F8F5EF] shadow-2xl z-110 flex flex-col translate-x-full p-2"
      >
        <div className="border border-black h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 ">
            <h2 className="text-2xl font-medium text-black leading-[33.60px]">
              Added to Cart
            </h2>

            <button
              onClick={onClose}
              className="text-black hover:text-black transition-colors text-2xl size-4 flex items-center justify-center"
            >
              <X />
            </button>
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-2">Add some items to get started!</p>
              </div>
            ) : (
              <ul className="space-y-6">
                {cart.items.map((item) => (
                  <li key={item.id} className=" pb-6">
                    <div className="flex flex-col gap-2 item-center justify-between items-start mb-3 lg:flex-row lg:gap-4">
                      <>
                        <img
                          src={item.image}
                          width={130}
                          height={190}
                          alt={item.title}
                        />
                      </>
                      <div className="flex flex-col gap-4 self-end justify-between">
                        <p className="font-medium text-lg text-black">
                          {item.title}
                        </p>

                        <div className="flex items-center gap-4 justify-between">
                          <div className="flex gap-1 items-center  rounded">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="px-4 py-2 bg-white border rounded-sm hover:bg-gray-100 transition-colors text-black"
                            >
                              −
                            </button>
                            <span className="px-4 py-2 bg-white border rounded-sm text-center font-medium text-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="px-4 py-2 bg-white border rounded-sm hover:bg-gray-100 transition-colors text-black"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-lg text-black">
                            R{(item.price * item.quantity).toFixed(2)}
                          </p>
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
            <div className=" p-6">
              <div className="hidden justify-between items-center mb-4">
                <span className="text-xl font-bold text-black">Total:</span>
                <span className="text-2xl font-bold text-black">
                  R{getTotalPrice().toFixed(2)}
                </span>
              </div>

              {!auth.isLoggedIn && (
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Please login to checkout
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full border text-black py-3 rounded hover:bg-white cursor-pointer disabled:bg-gray-400 transition-colors font-medium mb-3"
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
  );
};
