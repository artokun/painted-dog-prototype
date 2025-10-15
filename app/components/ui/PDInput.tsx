import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { CheckboxIcon } from "../icons/Checkbox";
import { PDButton } from "./PDButton";

interface PDInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  noUnderline?: boolean;
  type?: "text" | "email" | "checkbox" | "tel" | "select" | "file" | string;
  options?: Array<{ value: string; label: string }>;
}

interface PDSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  noUnderline?: boolean;
  placeholder?: string;
  type?: "select";
  options?: Array<{ value: string; label: string }>;
  value?: string;
}

export const PDInput = forwardRef<
  HTMLInputElement | HTMLSelectElement,
  PDInputProps | PDSelectProps
>(
  (
    {
      children,
      label,
      type,
      noUnderline = false,
      onChange,
      options,
      placeholder,
      value,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string>("");

    // Character filtering functions
    const isNameCharacterAllowed = (char: string) => {
      // Allow letters, spaces, hyphens, apostrophes, and some international characters
      return /^[a-zA-ZÀ-ÿĀ-žА-я\s\-']*$/.test(char);
    };

    const isPhoneCharacterAllowed = (char: string) => {
      // Allow digits, spaces, hyphens, plus signs, and parentheses
      return /^[\d\s\-\+\(\)]*$/.test(char);
    };

    const filterInput = (inputValue: string, filterType: 'name' | 'phone'): string => {
      if (filterType === 'name') {
        return inputValue.replace(/[^a-zA-ZÀ-ÿĀ-žА-я\s\-']/g, '');
      } else if (filterType === 'phone') {
        return inputValue.replace(/[^\d\s\-\+\(\)]/g, '');
      }
      return inputValue;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalChecked(e.target.checked);
      onChange?.(e as any); // Call the external onChange if provided
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isNameField = label?.toLowerCase().includes('name') || label?.toLowerCase().includes('surname');
      const isPhoneField = type === 'tel' || label?.toLowerCase().includes('phone');
      
      if (isNameField || isPhoneField) {
        const filterType = isNameField ? 'name' : 'phone';
        const filteredValue = filterInput(e.target.value, filterType);
        
        if (filteredValue !== e.target.value) {
          // Update the input value and create a new event
          e.target.value = filteredValue;
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: filteredValue },
            currentTarget: { ...e.currentTarget, value: filteredValue }
          };
          onChange?.(syntheticEvent as any);
        } else {
          onChange?.(e as any);
        }
      } else {
        onChange?.(e as any);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isNameField = label?.toLowerCase().includes('name') || label?.toLowerCase().includes('surname');
      const isPhoneField = type === 'tel' || label?.toLowerCase().includes('phone');
      
      if (isNameField && !isNameCharacterAllowed(e.key)) {
        e.preventDefault();
      } else if (isPhoneField && !isPhoneCharacterAllowed(e.key)) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const isNameField = label?.toLowerCase().includes('name') || label?.toLowerCase().includes('surname');
      const isPhoneField = type === 'tel' || label?.toLowerCase().includes('phone');
      
      if (isNameField || isPhoneField) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const filterType = isNameField ? 'name' : 'phone';
        const filteredText = filterInput(pastedText, filterType);
        
        // Update the input value
        const target = e.currentTarget;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        const currentValue = target.value;
        const newValue = currentValue.slice(0, start) + filteredText + currentValue.slice(end);
        
        target.value = newValue;
        
        // Trigger onChange
        const syntheticEvent = {
          target: { ...target, value: newValue },
          currentTarget: { ...target, value: newValue }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent as any);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        if (files.length === 1) {
          setSelectedFileName(files[0].name);
        } else {
          setSelectedFileName(`${files.length} files selected`);
        }
      } else {
        setSelectedFileName("");
      }
      onChange?.(e as any);
    };

    // Use external checked prop if provided, otherwise use internal state
    const checked =
      (props as any).checked !== undefined
        ? (props as any).checked
        : internalChecked;

    switch (type) {
      case "text":
      case "email":
      case "tel":
        return (
          <label className="flex gap-1 items-center" htmlFor={props.id}>
            {label && <span>{label}</span>}
            <input
              ref={ref as any}
              placeholder={placeholder}
              className={cn(
                "border-b border-black py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 placeholder:text-end text-right",
                "bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent]",
                "text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40",
                "scroll-m-0",
                noUnderline && "border-b-0"
              )}
              type={type}
              onChange={handleTextChange}
              value={value}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              onFocus={(e) => {
                e.preventDefault();
                const currentScrollPos = e.target.parentElement?.parentElement?.parentElement?.parentElement?.scrollTop;
                if (currentScrollPos !== undefined) {
                  requestAnimationFrame(() => {
                    e.target.parentElement?.parentElement?.parentElement?.parentElement?.scrollTo({ top: currentScrollPos });
                  });
                }
              }}
              {...(props as any)}
            />
          </label>
        );

      case "select":
        return (
          <label className="flex gap-1 items-end" htmlFor={props.id}>
            {label && <span className="max-w-[200px]">{label}</span>}
            <select
              ref={ref as any}
              className={cn(
                "border-b border-black py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 bg-transparent cursor-pointer text-end",
                "text-[#1A1A1A]",
                "scroll-m-0",
                !value && "text-[#1A1A1A] opacity-40",
                noUnderline && "border-b-0"
              )}
              onChange={onChange as any}
              defaultValue=""
              value={value}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              onFocus={(e) => {
                e.preventDefault();
                const currentScrollPos = e.target.parentElement?.parentElement?.parentElement?.parentElement?.scrollTop;
                if (currentScrollPos !== undefined) {
                  requestAnimationFrame(() => {
                    e.target.parentElement?.parentElement?.parentElement?.parentElement?.scrollTo({ top: currentScrollPos });
                  });
                }
              }}
              {...(props as any)}
            >
              <option value="">
                {placeholder || "Select an option"}&nbsp;
              </option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}&nbsp;
                </option>
              ))}
            </select>
          </label>
        );

      case "file":
        return (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end border-b border-black pb-2 gap-4">
              {label && <span className="flex-shrink-0">{label}</span>}
              <span className={cn(
                "text-sm truncate min-w-0",
                selectedFileName ? "text-[#1A1A1A] font-medium" : "text-[#1A1A1A] opacity-40"
              )}>
                {selectedFileName || placeholder}
              </span>
            </div>
            <div className="w-fit mt-4">
              <PDButton
                ref={ref as any}
                fileInput
                accept={(props as any).accept}
                multiple={(props as any).multiple}
                onFileChange={handleFileChange}
                {...(props as any)}
              >
                {selectedFileName ? "Change file" : "Upload file"}{(props as any).multiple && "(s)"}
              </PDButton>
            </div>
          </div>
        );

      case "checkbox": {
        return (
          <div>
            <label className="flex gap-4 items-start" htmlFor={props.id}>
              <CheckboxIcon
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
                checked={checked}
                className="min-w-5 min-h-5 max-w-5 max-h-5 focus:outline-none focus:ring-0 cursor-pointer"
              />
              <span>
                <input
                  tabIndex={-1}
                  ref={ref as any}
                  id={props.id}
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={handleChange}
                  {...(props as any)}
                />
                {children}
              </span>
            </label>
          </div>
        );
      }
      default:
        return (
          <input
            ref={ref as any}
            placeholder={placeholder}
            className="border border-black rounded-sm p-2 h-8 bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent] text-right text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40"
            onChange={onChange as any}
            value={value}
            {...(props as any)}
          />
        );
    }
  }
);

PDInput.displayName = "PDInput";
