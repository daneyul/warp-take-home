"use client";

import { useAtom } from "jotai";
import { viewModeAtom, currentDateAtom } from "@/lib/atoms";
import { ViewMode } from "@/lib/types";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import * as Tabs from "@radix-ui/react-tabs";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import AddEventDialog from "./AddEventDialog";

export default function CalendarHeader() {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const monthRef = useRef<HTMLButtonElement>(null);
  const dayRef = useRef<HTMLButtonElement>(null);

  const handlePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateDisplay = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (viewMode === "week") {
      return format(currentDate, "MMMM yyyy");
    } else {
      return format(currentDate, "MMMM d, yyyy");
    }
  };

  useEffect(() => {
    const activeTab = viewMode === "month" ? monthRef.current : dayRef.current;
    if (activeTab) {
      const parent = activeTab.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        setIndicatorStyle({
          left: tabRect.left - parentRect.left,
          width: tabRect.width,
        });
      }
    }
  }, [viewMode]);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {getDateDisplay()}
        </h1>

        <button
          onClick={handleToday}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Today
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tabs.Root
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
        >
          <Tabs.List className="relative inline-flex rounded-lg border border-gray-300 p-1">
            <motion.div
              className="absolute rounded-md bg-gray-900"
              style={{
                height: "calc(100% - 2px)",
                top: "1px",
              }}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
            <Tabs.Trigger
              ref={monthRef}
              value="month"
              className="relative z-10 rounded-md px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:text-white"
            >
              Month
            </Tabs.Trigger>

            <Tabs.Trigger
              ref={dayRef}
              value="day"
              className="relative z-10 rounded-md px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:text-white"
            >
              Day
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        <AddEventDialog />
      </div>
    </div>
  );
}
