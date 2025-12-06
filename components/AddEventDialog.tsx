'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { eventsAtom } from '@/lib/atoms';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Cross2Icon, PlusIcon, ChevronDownIcon, CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { CalendarEvent, EventType } from '@/lib/types';
import { parseDateInUserTimezone, getUserTimezone } from '@/lib/timezone-utils';
import { dialogOverlayClass, dialogContentClass } from '@/lib/dialog-styles';
import { motion, AnimatePresence } from 'framer-motion';
import useMeasure from 'react-use-measure';

interface AddEventDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export default function AddEventDialog({ open: externalOpen, onOpenChange: externalOnOpenChange, showTrigger = true }: AddEventDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [events, setEvents] = useAtom(eventsAtom);
  const [ref, bounds] = useMeasure();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting' as EventType,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false,
    person: '',
    description: '',
  });

  // Reset isTransitioning when dialog opens and set start date to today
  useEffect(() => {
    if (open) {
      setIsTransitioning(false);
      // Set start date to today in YYYY-MM-DD format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;
      
      setFormData(prev => ({
        ...prev,
        startDate: todayString,
      }));
    }
  }, [open]);

  // Check for overlaps with time-off events
  const getTimeOffOverlaps = (): Array<{ person: string }> => {
    if (!formData.startDate) return [];

    let startDateTime: Date;
    let endDateTime: Date;

    if (formData.isAllDay) {
      // For all-day events, use start of day and end of day
      const startDate = parseDateInUserTimezone(formData.startDate);
      const endDate = parseDateInUserTimezone(formData.endDate || formData.startDate);
      
      // Set to start of day (00:00) and end of day (23:59:59.999)
      startDateTime = new Date(startDate);
      startDateTime.setUTCHours(0, 0, 0, 0);
      
      endDateTime = new Date(endDate);
      endDateTime.setUTCHours(23, 59, 59, 999);
    } else {
      startDateTime = parseDateInUserTimezone(formData.startDate, formData.startTime || '00:00');
      endDateTime = parseDateInUserTimezone(formData.endDate || formData.startDate, formData.endTime || '23:59');
    }

    // Get all time-off events
    const timeOffEvents = events.filter(event => event.type === 'time-off' && event.person);

    const overlaps: Array<{ person: string }> = [];

    const seenPeople = new Set<string>();
    
    timeOffEvents.forEach(event => {
      // Check if the proposed event overlaps with this time-off event
      if (startDateTime < event.endTime && endDateTime > event.startTime) {
        if (event.person && !seenPeople.has(event.person)) {
          overlaps.push({ person: event.person });
          seenPeople.add(event.person);
        }
      }
    });

    return overlaps;
  };

  const timeOffOverlaps = getTimeOffOverlaps();

  // Validate date range
  const getDateRangeError = (): { field: 'startDate' | 'endDate' | 'startTime' | 'endTime' | null; message: string } | null => {
    if (!formData.startDate) return null;

    const endDate = formData.endDate || formData.startDate;
    
    if (formData.isAllDay) {
      // For all-day events, just compare dates
      if (formData.endDate && formData.endDate < formData.startDate) {
        return { field: 'endDate', message: 'End date cannot be before start date' };
      }
    } else {
      // For timed events, compare date + time
      if (formData.endDate && formData.endDate < formData.startDate) {
        return { field: 'endDate', message: 'End date cannot be before start date' };
      }
      
      // Check if all fields are the same (start date = end date and start time = end time)
      if (
        endDate === formData.startDate &&
        formData.startTime &&
        formData.endTime &&
        formData.startTime === formData.endTime
      ) {
        return { field: 'endTime', message: 'Times are not possible' };
      }
      
      // If same date, check if end time is before start time
      if (endDate === formData.startDate && formData.startTime && formData.endTime) {
        if (formData.endTime < formData.startTime) {
          return { field: 'endTime', message: 'End time cannot be before start time' };
        }
      }
    }

    return null;
  };

  const dateRangeError = getDateRangeError();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if there's a date range error
    if (dateRangeError) {
      return;
    }
    e.preventDefault();

    const startDateTime = formData.isAllDay
      ? parseDateInUserTimezone(formData.startDate)
      : parseDateInUserTimezone(formData.startDate, formData.startTime);

    const endDateTime = formData.isAllDay
      ? parseDateInUserTimezone(formData.endDate || formData.startDate)
      : parseDateInUserTimezone(formData.endDate || formData.startDate, formData.endTime);

    const isPartialDay = !formData.isAllDay && formData.startDate === (formData.endDate || formData.startDate);

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: formData.title,
      type: formData.type,
      startTime: startDateTime,
      endTime: endDateTime,
      isAllDay: formData.isAllDay,
      isPartialDay: isPartialDay,
      timezone: getUserTimezone(),
      person: formData.person || undefined,
      description: formData.description || undefined,
    };

    setEvents([...events, newEvent]);
    setOpen(false);

    // Reset form
    setFormData({
      title: '',
      type: 'meeting',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      isAllDay: false,
      person: '',
      description: '',
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <Dialog.Trigger asChild>
          <button className="inline-flex items-center gap-2 rounded-md bg-black/80 px-4 py-2 text-sm font-medium text-white hover:bg-black/70">
            <PlusIcon className="h-4 w-4" />
            Add Event
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlayClass} />
        <Dialog.Content className={dialogContentClass}>
          <motion.div
            initial={false}
            animate={isTransitioning ? { height: bounds.height > 0 ? bounds.height : 'auto' } : {}}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            style={!isTransitioning ? { height: 'auto' } : undefined}
          >
            <div ref={ref}>
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold">
                  Add New Event
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="rounded-md p-1 hover:bg-zinc-100" aria-label="Close">
                    <Cross2Icon className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Time-off Overlap Alerts */}
            {timeOffOverlaps.length > 0 && (
              <div className="space-y-2">
                {timeOffOverlaps.map((overlap, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 shrink-0" />
                    <span className="text-sm text-yellow-800">
                      Overlaps with {overlap.person}'s time off
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Team Standup"
              />
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium">
                Event Type *
              </label>
              <Select.Root
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as EventType })
                }
                required
              >
                <Select.Trigger
                  id="type"
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center justify-between"
                >
                  <Select.Value placeholder="Select event type" />
                  <Select.Icon>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-lg z-50">
                    <Select.Viewport className="p-1">
                      <Select.Item
                        value="meeting"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                      >
                        <Select.ItemText>Meeting</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="deadline"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                      >
                        <Select.ItemText>Deadline</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="company-event"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                      >
                        <Select.ItemText>Company Event</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="time-off"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                      >
                        <Select.ItemText>Time Off</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="birthday"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                      >
                        <Select.ItemText>Birthday</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="work-anniversary"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                      >
                        <Select.ItemText>Work Anniversary</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Person (for certain event types) */}
            {(formData.type === 'time-off' ||
              formData.type === 'birthday' ||
              formData.type === 'work-anniversary') && (
              <div>
                <label htmlFor="person" className="block text-sm font-medium">
                  Person
                </label>
                <Select.Root
                  value={formData.person}
                  onValueChange={(value) => setFormData({ ...formData, person: value })}
                >
                  <Select.Trigger
                    id="person"
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <Select.Value placeholder="Select person" />
                    <Select.Icon>
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-zinc-500">
                            Engineering
                          </Select.Label>
                          <Select.Item
                            value="Sarah Chen"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Sarah Chen</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Alex Kim"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Alex Kim</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Jordan Lee"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Jordan Lee</Select.ItemText>
                          </Select.Item>
                        </Select.Group>

                        <Select.Separator className="my-1 h-px bg-zinc-200" />

                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-zinc-500">
                            Operations
                          </Select.Label>
                          <Select.Item
                            value="Emma Wilson"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Emma Wilson</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Marcus Rodriguez"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Marcus Rodriguez</Select.ItemText>
                          </Select.Item>
                        </Select.Group>

                        <Select.Separator className="my-1 h-px bg-zinc-200" />

                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-zinc-500">
                            Design
                          </Select.Label>
                          <Select.Item
                            value="Riley Patel"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Riley Patel</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Taylor Morgan"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Taylor Morgan</Select.ItemText>
                          </Select.Item>
                        </Select.Group>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            )}

            {/* All Day Toggle */}
            <div className="flex items-center gap-2">
              <Checkbox.Root
                id="allDay"
                checked={formData.isAllDay}
                onCheckedChange={(checked) => {
                  setIsTransitioning(true);
                  setFormData({ ...formData, isAllDay: checked === true });
                }}
                className="flex h-4 w-4 items-center justify-center rounded border border-zinc-300 hover:bg-zinc-100 bg-white data-[state=checked]:border-black data-[state=checked]:bg-black"
              >
                <Checkbox.Indicator>
                  <CheckIcon className="h-3 w-3 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label htmlFor="allDay" className="text-sm font-medium">
                All day event
              </label>
            </div>

            {/* Date & Time Container */}
            <div className={formData.isAllDay ? "flex gap-3" : "space-y-4"}>
              {/* Start Date & Time */}
              <div className={formData.isAllDay ? "flex-1" : "grid grid-cols-2 gap-3"}>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      dateRangeError?.field === 'startDate'
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {dateRangeError?.field === 'startDate' && (
                    <p className="mt-1 text-sm text-red-600">{dateRangeError.message}</p>
                  )}
                </div>
                {!formData.isAllDay && (
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        dateRangeError?.field === 'startTime'
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {dateRangeError?.field === 'startTime' && (
                      <p className="mt-1 text-sm text-red-600">{dateRangeError.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* End Date & Time */}
              <div className={formData.isAllDay ? "flex-1" : "grid grid-cols-2 gap-3"}>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      dateRangeError?.field === 'endDate'
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {dateRangeError?.field === 'endDate' && (
                    <p className="mt-1 text-sm text-red-600">{dateRangeError.message}</p>
                  )}
                </div>
                {!formData.isAllDay && (
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium">
                      End Time *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        dateRangeError?.field === 'endTime'
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {dateRangeError?.field === 'endTime' && (
                      <p className="mt-1 text-sm text-red-600">{dateRangeError.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={!!dateRangeError}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  dateRangeError
                    ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                    : 'bg-black/80 text-white hover:bg-black/70'
                }`}
              >
                Add Event
              </button>
            </div>
              </form>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
