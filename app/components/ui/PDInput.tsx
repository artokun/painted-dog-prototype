import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PDInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const PDInput = forwardRef<HTMLInputElement, PDInputProps>(
  ({ children, label, type, onChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalChecked(e.target.checked);
      onChange?.(e); // Call the external onChange if provided
    };

    // Use external checked prop if provided, otherwise use internal state
    const checked =
      props.checked !== undefined ? props.checked : internalChecked;

    switch (type) {
      case "text":
      case "email":
        return (
          <label className="flex gap-1 items-center" htmlFor={props.id}>
            {label && <span>{label}</span>}
            <input
              ref={ref}
              className="border-b border-black p-2 h-8 flex-1 focus:outline-none focus:ring-0 placeholder:text-end"
              type={type}
              onChange={onChange}
              {...props}
            />
          </label>
        );
      case "checkbox": {
        return (
          <div>
            <label className="flex gap-4 items-start" htmlFor={props.id}>
              <span
                className={cn(
                  "mt-0.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] border border-black flex items-center justify-center cursor-pointer background-transparent focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
                  checked && "bg-black"
                )}
                tabIndex={0}
                role="checkbox"
                aria-checked={checked}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    const syntheticEvent = {
                      target: { checked: !checked },
                      currentTarget: { checked: !checked },
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleChange(syntheticEvent);
                  }
                }}
              >
                <CheckIcon
                  className={cn(
                    "opacity-0 text-black transition-opacity duration-100",
                    checked && "opacity-100 text-white"
                  )}
                />
              </span>
              <input
                tabIndex={-1}
                ref={ref}
                id={props.id}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={handleChange}
                {...props}
              />
              {children}
            </label>
          </div>
        );
      }
      default:
        return (
          <input
            ref={ref}
            className="border border-black rounded-sm p-2 h-8"
            onChange={onChange}
            {...props}
          />
        );
    }
  }
);

PDInput.displayName = "PDInput";
