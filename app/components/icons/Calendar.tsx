import { cn } from "@/lib/utils";

export const CalendarIcon = ({
  checked,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { checked: boolean }) => {
  return (
    <svg
      height="100%"
      width="100%"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        className={cn(
          "origin-[50%_58%] rotate-0 transition-transform duration-100",
          checked && "rotate-45"
        )}
        d="M9.16737 15.2035L10.8338 15.2035L10.8338 12.5012L13.5361 12.5012L13.5361 10.8348L10.8338 10.8348L10.8338 8.13243L9.16737 8.13243L9.16737 10.8348H6.46504V12.5012H9.16737L9.16737 15.2035Z"
        fill="currentColor"
      />
      <path
        d="M15.8333 3.33268H14.1667V1.66602H12.5V3.33268H7.5V1.66602H5.83333V3.33268H4.16667C3.2475 3.33268 2.5 4.08018 2.5 4.99935V16.666C2.5 17.5852 3.2475 18.3327 4.16667 18.3327H15.8333C16.7525 18.3327 17.5 17.5852 17.5 16.666V4.99935C17.5 4.08018 16.7525 3.33268 15.8333 3.33268ZM15.835 16.666H4.16667V6.66602H15.8333L15.835 16.666Z"
        fill="currentColor"
      />
    </svg>
  );
};
