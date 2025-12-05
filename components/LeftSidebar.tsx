'use client';

import { useAtom } from 'jotai';
import { eventTypeFiltersAtom } from '@/lib/atoms';
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';
import { EventType, EVENT_COLORS } from '@/lib/types';
import AddCategoryDialog from './AddCategoryDialog';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'meeting', label: 'Meetings' },
  { value: 'company-event', label: 'Company Events' },
  { value: 'time-off', label: 'Time Off' },
  { value: 'birthday', label: 'Birthdays' },
  { value: 'work-anniversary', label: 'Work Anniversaries' },
  { value: 'deadline', label: 'Deadlines' },
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
    <div className="w-64 flex-shrink-0 p-6" style={{ backgroundColor: '#EEEEEE' }}>
      <div className="space-y-6">

        <div>
          <h2 className="text-sm font-semibold text-gray-900">Events</h2>
          <p className="mt-1 text-xs text-gray-600">Toggle visibility by type</p>
        </div>

        <div className="space-y-2">
          {EVENT_TYPES.map((eventType) => {
            const isHidden = filters.has(eventType.value);
            const colors = EVENT_COLORS[eventType.value];

            return (
              <button
                key={eventType.value}
                onClick={() => toggleFilter(eventType.value)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/50"
              >
                <div className="flex-shrink-0">
                  {isHidden ? (
                    <EyeClosedIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeOpenIcon className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div
                  className={`h-3 w-3 flex-shrink-0 rounded ${colors.bg} ${colors.border} border`}
                ></div>
                <span
                  className={`flex-1 text-sm font-medium transition-opacity ${
                    isHidden ? 'text-gray-400 opacity-50' : 'text-gray-700'
                  }`}
                >
                  {eventType.label}
                </span>
              </button>
            );
          })}
        </div>

        {filters.size > 0 && (
          <button
            onClick={() => setFilters(new Set())}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Show all
          </button>
        )}
      </div>
    </div>
  );
}
