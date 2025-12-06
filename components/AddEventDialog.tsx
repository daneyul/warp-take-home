'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { eventsAtom } from '@/lib/atoms';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Cross2Icon, PlusIcon, ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons';
import { CalendarEvent, EventType } from '@/lib/types';
import { parseDateInUserTimezone, getUserTimezone } from '@/lib/timezone-utils';
import { dialogOverlayClass, dialogContentClass } from '@/lib/dialog-styles';
import { motion, AnimatePresence } from 'framer-motion';
import useMeasure from 'react-use-measure';

export default function AddEventDialog() {
  const [open, setOpen] = useState(false);
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

  // Reset isTransitioning when dialog opens
  useEffect(() => {
    if (open) {
      setIsTransitioning(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
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
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md bg-black/80 px-4 py-2 text-sm font-medium text-white hover:bg-black/70">
          <PlusIcon className="h-4 w-4" />
          Add Event
        </button>
      </Dialog.Trigger>
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
                  <button className="rounded-md p-1 hover:bg-gray-100" aria-label="Close">
                    <Cross2Icon className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center justify-between"
                >
                  <Select.Value placeholder="Select event type" />
                  <Select.Icon>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                    <Select.Viewport className="p-1">
                      <Select.Item
                        value="meeting"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                      >
                        <Select.ItemText>Meeting</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="deadline"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                      >
                        <Select.ItemText>Deadline</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="company-event"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                      >
                        <Select.ItemText>Company Event</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="time-off"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                      >
                        <Select.ItemText>Time Off</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="birthday"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                      >
                        <Select.ItemText>Birthday</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="work-anniversary"
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
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
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <Select.Value placeholder="Select person" />
                    <Select.Icon>
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-gray-500">
                            Engineering
                          </Select.Label>
                          <Select.Item
                            value="Sarah Chen"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                          >
                            <Select.ItemText>Sarah Chen</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Alex Kim"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                          >
                            <Select.ItemText>Alex Kim</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Jordan Lee"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                          >
                            <Select.ItemText>Jordan Lee</Select.ItemText>
                          </Select.Item>
                        </Select.Group>

                        <Select.Separator className="my-1 h-px bg-gray-200" />

                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-gray-500">
                            Operations
                          </Select.Label>
                          <Select.Item
                            value="Emma Wilson"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                          >
                            <Select.ItemText>Emma Wilson</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Marcus Rodriguez"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                          >
                            <Select.ItemText>Marcus Rodriguez</Select.ItemText>
                          </Select.Item>
                        </Select.Group>

                        <Select.Separator className="my-1 h-px bg-gray-200" />

                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-gray-500">
                            Design
                          </Select.Label>
                          <Select.Item
                            value="Riley Patel"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
                          >
                            <Select.ItemText>Riley Patel</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Taylor Morgan"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-gray-100 data-[state=checked]:bg-gray-200"
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
                className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 hover:bg-gray-100 bg-white data-[state=checked]:border-black data-[state=checked]:bg-black"
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
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
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
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
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
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
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
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
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
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-md bg-black/80 px-4 py-2 text-sm font-medium text-white hover:bg-black/70"
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
