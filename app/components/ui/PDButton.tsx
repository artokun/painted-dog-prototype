import { cn } from "@/lib/utils";

interface PDButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
}

export const PDButton = ({
  children,
  primary = false,
  className,
  ...props
}: PDButtonProps) => {
  return (
    <button
      className={cn(
        "px-3 h-8 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100",
        "hover:translate-y-[-2px] hover:shadow-md",
        primary
          ? "bg-black hiov text-white active:outline active:outline-black"
          : "bg-[#F9F6F0] hover:bg-[#F2EFE9] active:bg-[#EBE6DB] text-black",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
