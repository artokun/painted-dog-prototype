import { PDButton } from "./ui/PDButton";
import { ShoppingCartIcon } from "./icons/ShoppingCart";

interface PurchaseButtonsProps {
  layout?: "horizontal" | "vertical" | "mobile";
  className?: string;
  isMobile?: boolean;
}

export function PurchaseButtons({ 
  layout = "horizontal", 
  className = "",
  isMobile = false 
}: PurchaseButtonsProps) {
  const containerClasses = layout === "horizontal" 
    ? "flex flex-wrap gap-3 md:gap-2" 
    : "flex flex-col gap-3";

  const shouldBeTall = layout === "vertical" || layout === "mobile" || isMobile;

  return (
    <div className={`${containerClasses} ${className}`}>
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
  );
}