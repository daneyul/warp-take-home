'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { eventsAtom } from '@/lib/atoms';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { CalendarEvent, EventType } from '@/lib/types';
import { parseDateInUserTimezone, getUserTimezone } from '@/lib/timezone-utils';

export default function AddEventDialog() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useAtom(eventsAtom);

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
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon className="h-4 w-4" />
          Add Event
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Add New Event
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-md p-1 hover:bg-gray-100" aria-label="Close">
                <Cross2Icon className="h-5 w-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Event Type *
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as EventType })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="company-event">Company Event</option>
                <option value="time-off">Time Off</option>
                <option value="birthday">Birthday</option>
                <option value="work-anniversary">Work Anniversary</option>
              </select>
            </div>

            {/* Person (for certain event types) */}
            {(formData.type === 'time-off' ||
              formData.type === 'birthday' ||
              formData.type === 'work-anniversary') && (
              <div>
                <label htmlFor="person" className="block text-sm font-medium text-gray-700">
                  Person
                </label>
                <input
                  type="text"
                  id="person"
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* All Day Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.isAllDay}
                onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                All day event
              </label>
            </div>

            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
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
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
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
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Event
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
