import { PDButton } from "./ui/PDButton";
import { ShoppingCartIcon } from "./icons/ShoppingCart";
import { addToCart } from "@/app/store/cartStore";
import { getProduct } from "@/lib/shopify-client";
import { useState, useEffect } from "react";
import { openCart } from "../store/cartUIStore";

interface PurchaseButtonsProps {
  layout?: "horizontal" | "vertical" | "mobile";
  className?: string;
  isMobile?: boolean;
  productHandle?: string;
}

interface Product {
  variantId: string;
  title: string;
  price: number;
  image?: string;
}

export function PurchaseButtons({
  layout = "horizontal",
  className = "",
  isMobile = false,
  productHandle = "bitterkomix-sketchbooks-journals",
}: PurchaseButtonsProps) {
  const [product, setProduct] = useState<Product | null>(null); // Fixed!
  const [justAdded, setJustAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showCart, setShowCart] = useState(false); // Add cart state

  const containerClasses =
    layout === "horizontal"
      ? "flex flex-wrap gap-3 md:gap-2"
      : "flex flex-col gap-3";

  const shouldBeTall = layout === "vertical" || layout === "mobile" || isMobile;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProduct(productHandle);

        if (data) {
          setProduct({
            variantId: data.variants.edges[0]?.node.id,
            title: data.title,
            price: parseFloat(data.variants.edges[0]?.node.price.amount),
            image: data.images.edges[0]?.node.url,
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productHandle]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.variantId,
        title: product.title,
        price: product.price,
        image: product.image,
      });

      setJustAdded(true);
      openCart(); // Open the cart
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  return (
    <>
      <div className={`${containerClasses} ${className}`}>
        {/* Add to Cart button */}
        {loading ? (
          <PDButton className="w-full" primary tall={shouldBeTall} disabled>
            Loading...
          </PDButton>
        ) : product ? (
          <PDButton
            onClick={handleAddToCart}
            className="w-full"
            primary
            tall={shouldBeTall}
          >
            <ShoppingCartIcon className="w-5 h-5 -mt-0.5" />
            {justAdded ? " Added" : `Add to Cart - R${product.price}`}
          </PDButton>
        ) : null}

        <PDButton
          href="https://flyleaf.co.za/product/bitterkomix-sketchbooks-journals/"
          className="w-full"
          target="_blank"
          primary
          tall={shouldBeTall}
        >
          <ShoppingCartIcon className="w-5 h-5 -mt-0.5" /> Buy for R760
        </PDButton>

        <PDButton
          href="https://stellenboschbooks.co.za/products/bitterkomix-sketchbooks-and-journals-a-kannemeyer-c-botes"
          className="w-full"
          tall={shouldBeTall}
          target="_blank"
        >
          Stellenbosch Books
        </PDButton>

        <div className="w-full flex gap-3">
          <PDButton
            href="https://booklounge.co.za/product/bitterkomix-sketchbooks-and-journals/"
            className="flex-1"
            tall={shouldBeTall}
            target="_blank"
          >
            Book Lounge
          </PDButton>
          <PDButton
            href="https://www.wordsworth.co.za/products/bitterkomix-sketchbooks-journals"
            className="flex-1"
            tall={shouldBeTall}
            target="_blank"
          >
            Wordsworth
          </PDButton>
        </div>

        <p className="pt-2 text-sm w-full flex justify-center">
          Also available in-store at select Exclusive Books.
        </p>
      </div>
    </>
  );
}
