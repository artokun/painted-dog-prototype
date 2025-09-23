import { cn } from "@/lib/utils";

export const CheckboxIcon = ({
  checked,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { checked: boolean }) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-opacity duration-100", className)}
      {...props}
    >
      <mask id="path-1-inside-1_7065_31839" fill="white">
        <rect x="1" y="1" width="16" height="16" rx="0.888889" />
      </mask>
      <path
        className={cn("opacity-0", checked && "opacity-100")}
        d="M16.1113 1C16.6021 1.00012 16.9999 1.39792 17 1.88867V16.1113C16.9999 16.6021 16.6021 16.9999 16.1113 17H1.88867C1.39792 16.9999 1.00012 16.6021 1 16.1113V1.88867C1.00012 1.39792 1.39792 1.00012 1.88867 1H16.1113ZM7.75488 10.4668L5.22168 7.93359L3.97754 9.17773L7.75488 12.9551L14.0215 6.68848L12.7773 5.44434L7.75488 10.4668Z"
        fill="currentColor"
      />
      <rect
        className={cn("opacity-100", checked && "opacity-0")}
        x="1"
        y="1"
        width="16"
        height="16"
        rx="0.888889"
        stroke="currentColor"
        stroke-width="2"
        mask="url(#path-1-inside-1_7065_31839)"
      />
    </svg>
  );
};
