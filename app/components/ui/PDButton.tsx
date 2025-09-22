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
        "bg-[#F9F6F0] text-black px-3 h-8 rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap",
        primary && "bg-black text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
