'use client';

import { useAtom } from 'jotai';
import { eventTypeFiltersAtom } from '@/lib/atoms';
import * as Popover from '@radix-ui/react-popover';
import * as Checkbox from '@radix-ui/react-checkbox';
import { MixerHorizontalIcon, CheckIcon } from '@radix-ui/react-icons';
import { EventType, EVENT_COLORS } from '@/lib/types';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'meeting', label: 'Meetings' },
  { value: 'company-event', label: 'Company Events' },
  { value: 'time-off', label: 'Time Off' },
  { value: 'birthday', label: 'Birthdays' },
  { value: 'work-anniversary', label: 'Work Anniversaries' },
  { value: 'deadline', label: 'Deadlines' },
];

export default function EventFilters() {
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

  const activeFilterCount = filters.size;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="relative inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <MixerHorizontalIcon className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          sideOffset={5}
          align="start"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Filter by Event Type</h3>
              <p className="mt-1 text-xs text-gray-500">Hide selected event types from the calendar</p>
            </div>

            <div className="space-y-3">
              {EVENT_TYPES.map((eventType) => {
                const isChecked = filters.has(eventType.value);
                const colors = EVENT_COLORS[eventType.value];

                return (
                  <div key={eventType.value} className="flex items-center gap-3">
                    <Checkbox.Root
                      id={eventType.value}
                      checked={isChecked}
                      onCheckedChange={() => toggleFilter(eventType.value)}
                      className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="h-4 w-4 text-white" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label
                      htmlFor={eventType.value}
                      className="flex flex-1 cursor-pointer items-center gap-2"
                    >
                      <span className={`h-3 w-3 rounded ${colors.bg} ${colors.border} border`}></span>
                      <span className="text-sm text-gray-700">{eventType.label}</span>
                    </label>
                  </div>
                );
              })}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(new Set())}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear all filters
              </button>
            )}
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
