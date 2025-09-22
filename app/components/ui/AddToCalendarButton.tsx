"use client";

import { PDButton } from "./PDButton";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  title: string;
  start: string; // ISO format: YYYYMMDDTHHMMSSZ
  end: string; // ISO format: YYYYMMDDTHHMMSSZ
  description?: string;
  location?: string;
}

interface AddToCalendarButtonProps {
  event: CalendarEvent;
  children?: React.ReactNode;
  className?: string;
}

export const AddToCalendarButton = ({
  event,
  children = "Add to calendar",
  className,
}: AddToCalendarButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGoogleCalendar = () => {
    const googleUrl = new URL("https://calendar.google.com/calendar/render");
    googleUrl.searchParams.set("action", "TEMPLATE");
    googleUrl.searchParams.set("text", event.title);
    googleUrl.searchParams.set("dates", `${event.start}/${event.end}`);

    if (event.description) {
      googleUrl.searchParams.set("details", event.description);
    }

    if (event.location) {
      googleUrl.searchParams.set("location", event.location);
    }

    window.open(googleUrl.toString(), "_blank");
    setIsOpen(false);
  };

  const handleDownloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Painted Dog Press//Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${event.start}
DTEND:${event.end}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${event.title}${
      event.description
        ? `
DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`
        : ""
    }${
      event.location
        ? `
LOCATION:${event.location}`
        : ""
    }
UID:${Date.now()}@painteddogpress.com
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.toLowerCase().replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <PDButton
        onClick={() => setIsOpen(!isOpen)}
        className={cn("flex items-center gap-1", className)}
      >
        {children}
        <svg
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </PDButton>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-[#F9F6F0] border border-black rounded-sm shadow-lg z-50 min-w-full">
          <button
            onClick={handleGoogleCalendar}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer rounded-sm whitespace-nowrap"
          >
            Add to Google Calendar
          </button>
          <button
            onClick={handleDownloadICS}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer rounded-sm whitespace-nowrap border-t border-gray-200"
          >
            Download .ics file
          </button>
        </div>
      )}
    </div>
  );
};
