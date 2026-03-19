"use client";

import { getTotalItems } from "@/app/store/cartStore";
import { ShoppingCart } from "lucide-react";
import { openCart } from "@/app/store/cartUIStore"; // Import open function

export const CartButton = () => {
  return (
    <button
      onClick={openCart}
      className="relative cursor-pointer text-black px-4 py-2 rounded"
    >
      <span className="absolute text-black bg-white w-4 h-4 text-[9px] flex items-center justify-center rounded-full top-[5px] right-2.5">
        {getTotalItems()}
      </span>
      <ShoppingCart />
    </button>
  );
};
