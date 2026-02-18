"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { animated, useSpring } from "@react-spring/web";
import { CalendarIcon } from "../icons/Calendar";

interface CalendarEvent {
  title: string;
  start: string; // ISO format: YYYYMMDDTHHMMSSZ
  end: string; // ISO format: YYYYMMDDTHHMMSSZ
  description?: string;
  location?: string;
}

interface AddToCalendarButtonProps {
  event: CalendarEvent;
  className?: string;
  tall?: boolean;
}

export const AddToCalendarButton = ({
  event,
  className,
  tall = false,
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

  const styles = useSpring({
    height: isOpen ? (tall ? 4 * 11 * 3 : 4 * 9 * 3) : tall ? 4 * 13 : 4 * 9,
    config: { duration: 100 },
  });

  return (
    <div className="relative min-h-13 md:min-h-9" ref={dropdownRef}>
      <animated.div
        style={styles}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "absolute top-0 left-0 flex flex-col items-center justify-start rounded-sm border border-black font-medium cursor-pointer whitespace-nowrap transition-all duration-100",
          "hover:translate-y-[-2px] hover:shadow-md active:bg-[#f9f6f0] overflow-hidden",
          isOpen && "shadow-md bg-[#f9f6f0] translate-y-[-2px]",
          tall && "h-13",
          className
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-full min-h-9 gap-2 px-3 py-2",
            tall && "py-0 min-h-13"
          )}
        >
          <CalendarIcon checked={isOpen} className="w-5 h-5 -mt-0.5" /> Add to
          calendar
        </div>
        <div className="flex flex-col font-normal w-full pt-0.5 py-2">
          <button
            onClick={handleGoogleCalendar}
            className="w-full px-3 py-1 text-center cursor-pointer whitespace-nowrap hover:font-medium active:text-neutral-900"
          >
            Add to Google Calendar
          </button>
          <button
            onClick={handleDownloadICS}
            className="w-full px-3 py-1 text-center cursor-pointer whitespace-nowrap hover:font-medium active:text-neutral-900"
          >
            Download .ics file
          </button>
        </div>
      </animated.div>
    </div>
  );
};
