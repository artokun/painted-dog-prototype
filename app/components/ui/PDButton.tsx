import { cn } from "@/lib/utils";
import { ThreeLink } from "../ThreeLink";
import { LinkProps } from "next/link";
import { ButtonHTMLAttributes } from "react";
import NextLink from "next/link";

interface PDButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  wide?: boolean;
  download?: string;
  tall?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export const PDButton = ({
  children,
  primary = false,
  wide = false,
  tall = false,
  className,
  href,
  download,
  target,
  rel,
  ...props
}: PDButtonProps) => {
  const Component = (
    target || download ? NextLink : href ? ThreeLink : "button"
  ) as React.ComponentType<
    LinkProps<"a"> | ButtonHTMLAttributes<HTMLButtonElement>
  >;
  const componentProps = href
    ? ({ href, download, target, rel, ...props } as LinkProps<"a">)
    : (props as ButtonHTMLAttributes<HTMLButtonElement>);

  return (
    <Component
      className={cn(
        "flex items-center gap-2 justify-center px-3 h-9 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100",
        "hover:translate-y-[-2px] hover:shadow-md active:bg-[#F2EFE9]",
        primary ? "bg-[#F9F6F0] text-black" : "bg-transparent text-black",
        wide && "px-4",
        tall && "h-13 px-4",
        className
      )}
      {...componentProps}
    >
      {children}
    </Component>
  );
};
