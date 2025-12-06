"use client";

import { useAtom } from "jotai";
import { eventTypeFiltersAtom } from "@/lib/atoms";
import { EyeOpenIcon, EyeClosedIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { EventType, EVENT_COLORS } from "@/lib/types";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "meeting", label: "Meetings" },
  { value: "company-event", label: "Company Events" },
  { value: "time-off", label: "Time Off" },
  { value: "birthday", label: "Birthdays" },
  { value: "work-anniversary", label: "Work Anniversaries" },
  { value: "deadline", label: "Deadlines" },
];

export default function LeftSidebar() {
  const [filters, setFilters] = useAtom(eventTypeFiltersAtom);

  const toggleFilter = (type: EventType) => {
    const newFilters = new Set(filters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setFilters(newFilters);
  };

  return (
    <div className="w-64 shrink-0 py-6 px-4 border-r border-gray-200">
      <div className="space-y-6">
        <h2 className="font-semibold">Lackluster Org</h2>

        <div className="space-y-2">
          {EVENT_TYPES.map((eventType) => {
            const isHidden = filters.has(eventType.value);
            const colors = EVENT_COLORS[eventType.value];

            return (
              <div
                key={eventType.value}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-black/5 cursor-pointer group"
              >
                <button
                  onClick={() => toggleFilter(eventType.value)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div
                    className={`h-3 w-3 shrink-0 rounded ${colors.bg} ${colors.border} border`}
                  ></div>
                  <span
                    className={`flex-1 text-sm font-medium transition-opacity ${
                      isHidden ? "opacity-50" : ""
                    }`}
                  >
                    {eventType.label}
                  </span>
                </button>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
                    >
                      <DotsVerticalIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="min-w-[180px] bg-white rounded-md shadow-lg border border-gray-200 p-1 z-50"
                      sideOffset={5}
                    >
                      <DropdownMenu.Item
                        className="px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer hover:bg-gray-100 outline-none"
                      >
                        Sync to Google
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            );
          })}
        </div>

        {filters.size > 0 ? (
          <button
            onClick={() => setFilters(new Set())}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Show all
          </button>
        ) : (
          <button
            onClick={() => setFilters(new Set(EVENT_TYPES.map((eventType) => eventType.value)))}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Hide all
          </button>
        )}
      </div>
    </div>
  );
}
