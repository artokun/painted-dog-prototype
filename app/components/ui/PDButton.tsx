import { cn } from "@/lib/utils";
import { ThreeLink } from "../ThreeLink";
import { LinkProps } from "next/link";
import { ButtonHTMLAttributes } from "react";

interface PDButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  href?: string;
}

export const PDButton = ({
  children,
  primary = false,
  className,
  href,
  ...props
}: PDButtonProps) => {
  const Component = (href ? ThreeLink : "button") as React.ComponentType<
    LinkProps<"a"> | ButtonHTMLAttributes<HTMLButtonElement>
  >;
  const componentProps = href
    ? ({ href } as LinkProps<"a">)
    : (props as ButtonHTMLAttributes<HTMLButtonElement>);

  return (
    <Component
      className={cn(
        "px-3 h-8 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100",
        "hover:translate-y-[-2px] hover:shadow-md",
        primary
          ? "bg-black hiov text-white active:outline active:outline-black"
          : "bg-[#F9F6F0] hover:bg-[#F2EFE9] active:bg-[#EBE6DB] text-black",
        className
      )}
      {...componentProps}
    >
      {children}
    </Component>
  );
};
