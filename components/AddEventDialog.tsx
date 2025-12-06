'use client';

import { useState, useEffect, startTransition } from 'react';
import { useAtom } from 'jotai';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Cross2Icon, PlusIcon, ChevronDownIcon, CheckIcon, ExclamationTriangleIcon, UpdateIcon } from '@radix-ui/react-icons';
import { allEventsAtom } from '@/lib/atoms';
import { CalendarEvent, EventType, RecurrenceFrequency } from '@/lib/types';
import { parseDateInUserTimezone, getUserTimezone } from '@/lib/timezone-utils';
import { dialogOverlayClass, dialogContentClass } from '@/lib/constants/dialog-styles';
import clsx from 'clsx';
import PersonSelect from '@/components/event/PersonSelect';
import { eventTypeSupportsPersonField } from '@/lib/utils/event-utils';
import { getDateRangeError, getTimeOffOverlaps } from '@/lib/utils/validation-utils';
import { EVENT_TYPE_CONFIGS } from '@/lib/constants/event-types';
import AutoHeightAnimationWrapper from '@/components/common/AutoHeightAnimationWrapper';
import DateTimeInputGroup from '@/components/form/DateTimeInputGroup';
import RecurrenceSettings from '@/components/form/RecurrenceSettings';
import TimezoneSelect from '@/components/form/TimezoneSelect';
import {
  formFieldClass,
  formLabelClass,
  buttonCancelClass,
  buttonPrimaryClass,
  buttonDisabledClass,
  selectTriggerClass,
  selectContentClass,
  selectItemClass,
  checkboxClass,
  dialogCloseButtonClass,
  warningAlertClass,
  warningTextClass,
} from '@/lib/constants/styles';

interface AddEventDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export default function AddEventDialog({ open: externalOpen, onOpenChange: externalOnOpenChange, showTrigger = true }: AddEventDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [events, setEvents] = useAtom(allEventsAtom);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    timezone: getUserTimezone(),
    isRecurring: false,
    recurrenceFrequency: 'daily' as RecurrenceFrequency,
    recurrenceDaysOfWeek: [] as number[],
    recurrenceEndDate: '',
  });

  // Reset isTransitioning when dialog opens and set start date to today
  useEffect(() => {
    if (open) {
      startTransition(() => {
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
      });
    }
  }, [open]);

  const timeOffOverlaps = getTimeOffOverlaps(events, formData);

  const dateRangeError = getDateRangeError(formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (dateRangeError) {
      return;
    }

    setIsSaving(true);

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
      timezone: formData.timezone,
      person: formData.person || undefined,
      description: formData.description || undefined,
      recurrence: formData.isRecurring
        ? {
            frequency: formData.recurrenceFrequency,
            daysOfWeek: formData.recurrenceFrequency === 'weekly' ? formData.recurrenceDaysOfWeek : undefined,
            endDate: formData.recurrenceEndDate ? parseDateInUserTimezone(formData.recurrenceEndDate) : undefined,
          }
        : undefined,
    };

    // Simulate saving with 1 second delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setEvents([...events, newEvent]);
    setIsSaving(false);
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
      timezone: getUserTimezone(),
      isRecurring: false,
      recurrenceFrequency: 'daily',
      recurrenceDaysOfWeek: [],
      recurrenceEndDate: '',
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
          <AutoHeightAnimationWrapper isTransitioning={isTransitioning}>
            <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold">
                  Add New Event
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className={dialogCloseButtonClass} aria-label="Close">
                    <Cross2Icon className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Time-off Overlap Alerts */}
            {timeOffOverlaps.length > 0 && (
              <div className="space-y-2">
                {timeOffOverlaps.map((overlap, index) => (
                  <div key={index} className={warningAlertClass}>
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 shrink-0" />
                    <span className={warningTextClass}>
                      Overlaps with {overlap.person}&apos;s time off
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className={formLabelClass}>
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={formFieldClass}
                placeholder="e.g., Team Standup"
              />
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="type" className={formLabelClass}>
                Event Type *
              </label>
              <Select.Root
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as EventType })
                }
                required
              >
                <Select.Trigger id="type" className={selectTriggerClass}>
                  <Select.Value placeholder="Select event type" />
                  <Select.Icon>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={selectContentClass}>
                    <Select.Viewport className="p-1">
                      {EVENT_TYPE_CONFIGS.map((config) => (
                        <Select.Item
                          key={config.value}
                          value={config.value}
                          className={selectItemClass}
                        >
                          <Select.ItemText>{config.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Person (for certain event types) */}
            {eventTypeSupportsPersonField(formData.type) && (
              <div>
                <label htmlFor="person" className={formLabelClass}>
                  Person
                </label>
                <PersonSelect
                  id="person"
                  value={formData.person}
                  onValueChange={(value) => setFormData({ ...formData, person: value })}
                />
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
                className={checkboxClass}
              >
                <Checkbox.Indicator>
                  <CheckIcon className="h-3 w-3 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label htmlFor="allDay" className="text-sm font-medium">
                All day event
              </label>
            </div>

            <div className={formData.isAllDay ? "flex gap-3" : "space-y-4"}>
              <DateTimeInputGroup
                label="Start Date"
                dateId="startDate"
                timeId="startTime"
                dateValue={formData.startDate}
                timeValue={formData.startTime}
                onDateChange={(value) => setFormData({ ...formData, startDate: value })}
                onTimeChange={(value) => setFormData({ ...formData, startTime: value })}
                isAllDay={formData.isAllDay}
                dateRequired
                timeRequired
                dateError={dateRangeError?.field === 'startDate' ? dateRangeError.message : undefined}
                timeError={dateRangeError?.field === 'startTime' ? dateRangeError.message : undefined}
              />
              <DateTimeInputGroup
                label="End Date"
                dateId="endDate"
                timeId="endTime"
                dateValue={formData.endDate}
                timeValue={formData.endTime}
                onDateChange={(value) => setFormData({ ...formData, endDate: value })}
                onTimeChange={(value) => setFormData({ ...formData, endTime: value })}
                isAllDay={formData.isAllDay}
                timeRequired
                dateError={dateRangeError?.field === 'endDate' ? dateRangeError.message : undefined}
                timeError={dateRangeError?.field === 'endTime' ? dateRangeError.message : undefined}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={formLabelClass}>
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={formFieldClass}
              />
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezone" className={formLabelClass}>
                Timezone
              </label>
              <TimezoneSelect
                value={formData.timezone}
                onChange={(timezone) => setFormData({ ...formData, timezone })}
              />
            </div>

            {/* Recurring Event Toggle */}
            <div className="flex items-center gap-2">
              <Checkbox.Root
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => {
                  setIsTransitioning(true);
                  if (!checked) {
                    // Reset recurrence fields when unchecking
                    setFormData({
                      ...formData,
                      isRecurring: false,
                      recurrenceFrequency: 'daily',
                      recurrenceDaysOfWeek: [],
                      recurrenceEndDate: '',
                    });
                  } else {
                    setFormData({ ...formData, isRecurring: true });
                  }
                }}
                className={checkboxClass}
              >
                <Checkbox.Indicator>
                  <CheckIcon className="h-3 w-3 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label htmlFor="isRecurring" className="text-sm font-medium">
                Recurring event
              </label>
            </div>

            {formData.isRecurring && (
              <RecurrenceSettings
                frequency={formData.recurrenceFrequency}
                daysOfWeek={formData.recurrenceDaysOfWeek}
                endDate={formData.recurrenceEndDate}
                onFrequencyChange={(value) => setFormData({ ...formData, recurrenceFrequency: value })}
                onDaysOfWeekChange={(days) => setFormData({ ...formData, recurrenceDaysOfWeek: days })}
                onEndDateChange={(date) => setFormData({ ...formData, recurrenceEndDate: date })}
              />
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <button type="button" className={buttonCancelClass} disabled={isSaving}>
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={!!dateRangeError || isSaving}
                className={clsx(
                  dateRangeError || isSaving ? buttonDisabledClass : buttonPrimaryClass,
                  'flex items-center gap-2'
                )}
              >
                {isSaving && <UpdateIcon className="h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Add Event'}
              </button>
            </div>
              </form>
          </AutoHeightAnimationWrapper>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
