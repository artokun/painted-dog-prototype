import { useSnapshot } from "valtio";
import {
  cartStore,
  getTotalItems,
  getTotalPrice,
  removeFromCart,
  clearCart,
} from "@/app/store/cartStore";
import { createCart } from "@/lib/shopify";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

export const CartButton = () => {
  const cart = useSnapshot(cartStore);
  const [showCart, setShowCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  return (
    <>
      <button
        onClick={() => setShowCart(!showCart)}
        className="relative cursor-pointer text-black px-4 py-2 rounded z-50"
      >
        <span className="absolute  text-black bg-white w-4 h-4 text-[9px] flex items-center justify-center rounded-full top-[5px] right-2.5">
          {getTotalItems()}
        </span>
        <ShoppingCart />
      </button>

      {showCart && (
        <div className="fixed top-16 right-4 bg-white border border-black p-4 rounded shadow-lg max-w-sm z-50 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Shopping Cart</h3>
            <button
              onClick={() => setShowCart(false)}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          {cart.items.length === 0 ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            <>
              <ul className="space-y-4 mb-4">
                {cart.items.map((item) => (
                  <li key={item.id} className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 border-x border-gray-300 min-w-[50px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-medium ml-auto">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-3">
                <div className="flex justify-between font-bold mb-3">
                  <span>Total:</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                  {isCheckingOut ? "Loading..." : "Checkout"}
                </button>
                <button
                  onClick={clearCart}
                  className="w-full mt-2 border border-black py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
