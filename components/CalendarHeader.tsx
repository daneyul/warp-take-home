"use client";

import { useAtom } from "jotai";
import { flushSync } from "react-dom";
import { viewModeAtom, currentDateAtom, navigationDirectionAtom } from "@/lib/atoms";
import { ViewMode } from "@/lib/types";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  setMonth,
  setYear,
} from "date-fns";
import * as Tabs from "@radix-ui/react-tabs";
import * as Select from "@radix-ui/react-select";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import AddEventDialog from "./AddEventDialog";

export default function CalendarHeader() {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
  const [direction, setDirection] = useAtom(navigationDirectionAtom);

  const handlePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      // Use flushSync to ensure direction is set before date change
      // This ensures AnimatePresence sees the direction change before the key change
      flushSync(() => {
        setDirection(-1);
      });
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      // Use flushSync to ensure direction is set before date change
      // This ensures AnimatePresence sees the direction change before the key change
      flushSync(() => {
        setDirection(1);
      });
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setViewMode('day');
  };

  const handleMonthChange = (monthIndex: string) => {
    setCurrentDate(setMonth(currentDate, parseInt(monthIndex)));
  };

  const handleYearChange = (yearValue: string) => {
    setCurrentDate(setYear(currentDate, parseInt(yearValue)));
  };

  const month = format(currentDate, "MMMM");
  const monthIndex = currentDate.getMonth().toString();
  const dayNumber = format(currentDate, "d");
  const year = format(currentDate, "yyyy");

  // Generate all 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(2024, i, 1);
    return {
      value: i.toString(),
      label: format(monthDate, "MMMM"),
    };
  });

  // Generate years (current year ± 10 years)
  const currentYear = parseInt(year);
  const years = Array.from({ length: 21 }, (_, i) => {
    const yearValue = currentYear - 10 + i;
    return {
      value: yearValue.toString(),
      label: yearValue.toString(),
    };
  });

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pl-4 pr-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <button
            onClick={handlePrevious}
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            className="flex items-center text-3xl font-bold"
            layout
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            <Select.Root value={monthIndex} onValueChange={handleMonthChange}>
              <Select.Trigger asChild>
                <button className="rounded-md px-2 py-1 text-3xl font-bold transition-colors hover:text-black/80 hover:bg-gray-100">
                  <Select.Value>{month}</Select.Value>
                </button>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="min-w-[160px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                  position="popper"
                >
                  <Select.Viewport className="max-h-[300px] p-1">
                    {months.map((monthOption) => (
                      <Select.Item
                        key={monthOption.value}
                        value={monthOption.value}
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm font-medium outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                      >
                        <Select.ItemText>{monthOption.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>

            {viewMode === "day" && (
              <AnimatePresence mode="wait" custom={direction}>
                <motion.span
                  key={format(currentDate, "yyyy-MM-dd")}
                  custom={direction}
                  layout
                  variants={{
                    enter: (dir: number) => ({
                      opacity: 0,
                      y: dir === 0 ? 0 : dir * 20,
                    }),
                    center: {
                      opacity: 1,
                      y: 0,
                    },
                    exit: (dir: number) => ({
                      opacity: 0,
                      y: dir === 0 ? 0 : dir * -20,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                >
                  {` ${dayNumber},`}
                </motion.span>
              </AnimatePresence>
            )}

            <Select.Root value={year} onValueChange={handleYearChange}>
              <Select.Trigger asChild>
                <button className="rounded-md px-2 py-1 text-3xl font-bold transition-colors hover:text-black/80 hover:bg-gray-100">
                  <Select.Value>{year}</Select.Value>
                </button>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="min-w-[120px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                  position="popper"
                >
                  <Select.Viewport className="max-h-[300px] p-1">
                    {years.map((yearOption) => (
                      <Select.Item
                        key={yearOption.value}
                        value={yearOption.value}
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm font-medium outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                      >
                        <Select.ItemText>{yearOption.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleToday}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100"
        >
          Today
        </button>
        <Tabs.Root
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
        >
          <LayoutGroup>
            <Tabs.List className="relative inline-flex items-center rounded-md border border-gray-300 p-1">
              <Tabs.Trigger value="month" asChild>
                <button
                  className={`rounded-md px-4 py-1 text-sm font-medium transition-colors text-black/50 hover:text-black/80 data-[state=active]:text-black/80 ${
                    viewMode === "month" ? "bg-gray-200" : ""
                  }`}
                >
                  Month
                </button>
              </Tabs.Trigger>

              <Tabs.Trigger value="day" asChild>
                <button
                  className={`rounded-md px-4 py-1 text-sm font-medium text-black/50 transition-colors hover:text-black/80 data-[state=active]:text-black/80 ${
                    viewMode === "day" ? "bg-gray-200" : ""
                  }`}
                >
                  Day
                </button>
              </Tabs.Trigger>
            </Tabs.List>
          </LayoutGroup>
        </Tabs.Root>
        <AddEventDialog />
      </div>
    </div>
  );
}
