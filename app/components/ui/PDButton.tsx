import { cn } from "@/lib/utils";
import { ThreeLink } from "../ThreeLink";
import { forwardRef, useRef } from "react";
import NextLink from "next/link";

interface PDButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  wide?: boolean;
  download?: string;
  tall?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  noUnderline?: boolean;
  fileInput?: boolean;
  accept?: string;
  multiple?: boolean;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PDButton = forwardRef<
  HTMLInputElement | HTMLButtonElement,
  PDButtonProps
>(
  (
    {
      children,
      primary = false,
      wide = false,
      tall = false,
      noUnderline = true,
      className,
      href,
      download,
      target,
      rel,
      fileInput = false,
      accept,
      multiple,
      onFileChange,
      ...props
    },
    ref
  ) => {
    const internalFileRef = useRef<HTMLInputElement>(null);

    // Handle file input click
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (fileInput) {
        e.preventDefault(); // Prevent form submission
        internalFileRef.current?.click();
      }
      props.onClick?.(e);
    };

    if (fileInput) {
      return (
        <>
          <input
            ref={(el) => {
              internalFileRef.current = el;
              // Also set the forwarded ref if provided
              if (ref) {
                if (typeof ref === "function") {
                  ref(el);
                } else {
                  ref.current = el;
                }
              }
            }}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={onFileChange}
            className="hidden"
            {...(props as any)}
          />
          <button
            type="button" // Explicitly set to button to prevent form submission
            onClick={handleClick}
            className={cn(
              "flex items-center gap-2 justify-center px-3 h-9 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100",
              "hover:translate-y-[-2px] hover:shadow-md active:bg-[#F2EFE9]",
              primary ? "bg-[#F9F6F0] text-black" : "bg-transparent text-black",
              wide && "px-4",
              tall && "min-h-13 px-4",
              className
            )}
          >
            {children}
          </button>
        </>
      );
    }

    const Component: any =
      target || download ? NextLink : href ? ThreeLink : "button";

    let componentProps: Record<string, unknown>;
    if (target || download) {
      componentProps = {
        href: href ?? "#",
        download,
        target,
        rel,
        ...props,
      };
    } else if (href) {
      // ThreeLink can handle noUnderline
      componentProps = {
        href,
        noUnderline,
        ...props,
      };
    } else {
      // Button element
      componentProps = props;
    }

    return (
      <Component
        ref={ref as any}
        className={cn(
          "flex items-center gap-2 justify-center px-3 h-9 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100",
          "hover:translate-y-[-2px] hover:shadow-md active:bg-[#F2EFE9]",
          primary ? "bg-[#F9F6F0] text-black" : "bg-transparent text-black",
          wide && "px-4",
          tall && "min-h-13 px-4",
          className
        )}
        {...componentProps}
      >
        {children}
      </Component>
    );
  }
);

PDButton.displayName = "PDButton";
