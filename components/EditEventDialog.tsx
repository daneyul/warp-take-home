"use client";

import { useState, useEffect, startTransition } from "react";
import { useAtom } from "jotai";
import { allEventsAtom, selectedEventAtom } from "@/lib/atoms";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Cross2Icon,
  LoopIcon,
  ArrowLeftIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { EventType, RecurrenceFrequency } from "@/lib/types";
import { parseDateInUserTimezone, getUserTimezone } from "@/lib/timezone-utils";
import { format } from "date-fns";
import {
  dialogOverlayClass,
  dialogContentClass,
} from "@/lib/constants/dialog-styles";
import { motion, AnimatePresence } from "framer-motion";
import AutoHeightAnimationWrapper from "@/components/common/AutoHeightAnimationWrapper";
import PersonSelect from "@/components/event/PersonSelect";
import TimezoneSelect from "@/components/form/TimezoneSelect";
import { eventTypeSupportsPersonField } from "@/lib/utils/event-utils";
import { useDeleteEvent } from "@/lib/hooks/useDeleteEvent";
import { extractBaseEventId } from "@/lib/utils/event-utils";
import {
  formFieldClass,
  formLabelClass,
  buttonCancelClass,
  buttonPrimaryClass,
  buttonDeleteExpandedClass,
  dialogCloseButtonClass,
} from "@/lib/constants/styles";
import {
  BIRTHDAY,
  COMPANY_EVENT,
  DAILY,
  DAILY_TEXT,
  DAYS,
  DEADLINE,
  MEETING,
  MONTHLY,
  MONTHLY_TEXT,
  TIME_OFF,
  WEEKLY,
  WEEKLY_TEXT,
  WORK_ANNIVERSARY,
} from "@/lib/constants/event-types";

export default function EditEventDialog() {
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const [events, setEvents] = useAtom(allEventsAtom);
  const [isSaving, setIsSaving] = useState(false);

  const {
    showDeleteConfirm,
    deleteClickedOnce,
    isTransitioning,
    setIsTransitioning,
    handleDeleteClick,
    handleDeleteAll,
    handleDeleteThisOnly,
    handleCancelDelete,
    resetDeleteState,
  } = useDeleteEvent({
    onDeleteComplete: () => setSelectedEvent(null),
  });

  const [formData, setFormData] = useState({
    title: "",
    type: MEETING as EventType,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    isAllDay: false,
    person: "",
    description: "",
    timezone: getUserTimezone(),
    isRecurring: false,
    recurrenceFrequency: DAILY as RecurrenceFrequency,
    recurrenceDaysOfWeek: [] as number[],
    recurrenceEndDate: "",
  });

  // Populate form when event is selected
  useEffect(() => {
    if (selectedEvent) {
      startTransition(() => {
        setIsTransitioning(false);
        resetDeleteState();
        setFormData({
          title: selectedEvent.title,
          type: selectedEvent.type,
          startDate: format(selectedEvent.startTime, "yyyy-MM-dd"),
          startTime: selectedEvent.isAllDay
            ? ""
            : format(selectedEvent.startTime, "HH:mm"),
          endDate: format(selectedEvent.endTime, "yyyy-MM-dd"),
          endTime: selectedEvent.isAllDay
            ? ""
            : format(selectedEvent.endTime, "HH:mm"),
          isAllDay: selectedEvent.isAllDay || false,
          person: selectedEvent.person || "",
          description: selectedEvent.description || "",
          timezone: selectedEvent.timezone || getUserTimezone(),
          isRecurring: !!selectedEvent.recurrence,
          recurrenceFrequency: selectedEvent.recurrence?.frequency || "daily",
          recurrenceDaysOfWeek: selectedEvent.recurrence?.daysOfWeek || [],
          recurrenceEndDate: selectedEvent.recurrence?.endDate
            ? format(selectedEvent.recurrence.endDate, "yyyy-MM-dd")
            : "",
        });
      });
    }
  }, [selectedEvent, resetDeleteState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSaving(true);

    // Extract base ID in case this is a recurring event instance
    const { baseId } = extractBaseEventId(selectedEvent.id);

    const startDateTime = formData.isAllDay
      ? parseDateInUserTimezone(formData.startDate)
      : parseDateInUserTimezone(formData.startDate, formData.startTime);

    const endDateTime = formData.isAllDay
      ? parseDateInUserTimezone(formData.endDate || formData.startDate)
      : parseDateInUserTimezone(
          formData.endDate || formData.startDate,
          formData.endTime
        );

    const isPartialDay =
      !formData.isAllDay &&
      formData.startDate === (formData.endDate || formData.startDate);

    const updatedEvent = {
      ...selectedEvent,
      id: baseId, // Use base ID for the actual event
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
            daysOfWeek:
              formData.recurrenceFrequency === "weekly"
                ? formData.recurrenceDaysOfWeek
                : undefined,
            endDate: formData.recurrenceEndDate
              ? parseDateInUserTimezone(formData.recurrenceEndDate)
              : undefined,
          }
        : undefined,
    };

    // Simulate saving with 1 second delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update using base ID to ensure we update the correct event
    setEvents(events.map((e) => (e.id === baseId ? updatedEvent : e)));
    setIsSaving(false);
    setSelectedEvent(null);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    resetDeleteState();
  };

  if (!selectedEvent) return null;

  return (
    <Dialog.Root
      open={!!selectedEvent}
      onOpenChange={(open) => !open && handleClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlayClass} />
        <Dialog.Content className={dialogContentClass}>
          <AutoHeightAnimationWrapper isTransitioning={isTransitioning}>
            <AnimatePresence mode="wait" initial={false}>
                {!showDeleteConfirm ? (
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
                        Edit Event
                        {selectedEvent.recurrence && (
                          <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium">
                            <LoopIcon className="h-3 w-3" />
                            Recurring
                          </span>
                        )}
                      </Dialog.Title>
                      <Dialog.Close asChild>
                        <button
                          className={dialogCloseButtonClass}
                          aria-label="Close"
                        >
                          <Cross2Icon className="h-5 w-5" />
                        </button>
                      </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="title" className={formLabelClass}>
                          Event Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          required
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className={formFieldClass}
                          placeholder="e.g., Team Standup"
                        />
                      </div>

                      <div>
                        <label htmlFor="type" className={formLabelClass}>
                          Event Type *
                        </label>
                        <select
                          id="type"
                          required
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              type: e.target.value as EventType,
                            })
                          }
                          className={formFieldClass}
                        >
                          <option value={MEETING}>Meeting</option>
                          <option value={DEADLINE}>Deadline</option>
                          <option value={COMPANY_EVENT}>Company Event</option>
                          <option value={TIME_OFF}>Time Off</option>
                          <option value={BIRTHDAY}>Birthday</option>
                          <option value={WORK_ANNIVERSARY}>
                            Work Anniversary
                          </option>
                        </select>
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
                            onValueChange={(value) =>
                              setFormData({ ...formData, person: value })
                            }
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="allDay"
                          checked={formData.isAllDay}
                          onChange={(e) => {
                            setIsTransitioning(true);
                            setFormData({
                              ...formData,
                              isAllDay: e.target.checked,
                            });
                          }}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="allDay" className="text-sm font-medium">
                          All day event
                        </label>
                      </div>

                      <div
                        className={
                          formData.isAllDay ? "flex gap-3" : "space-y-4"
                        }
                      >
                        <div
                          className={
                            formData.isAllDay
                              ? "flex-1"
                              : "grid grid-cols-2 gap-3"
                          }
                        >
                          <div>
                            <label
                              htmlFor="startDate"
                              className={formLabelClass}
                            >
                              Start Date *
                            </label>
                            <input
                              type="date"
                              id="startDate"
                              required
                              value={formData.startDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  startDate: e.target.value,
                                })
                              }
                              className={formFieldClass}
                            />
                          </div>
                          {!formData.isAllDay && (
                            <div>
                              <label
                                htmlFor="startTime"
                                className={formLabelClass}
                              >
                                Start Time *
                              </label>
                              <input
                                type="time"
                                id="startTime"
                                required
                                value={formData.startTime}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    startTime: e.target.value,
                                  })
                                }
                                className={formFieldClass}
                              />
                            </div>
                          )}
                        </div>

                        <div
                          className={
                            formData.isAllDay
                              ? "flex-1"
                              : "grid grid-cols-2 gap-3"
                          }
                        >
                          <div>
                            <label htmlFor="endDate" className={formLabelClass}>
                              End Date
                            </label>
                            <input
                              type="date"
                              id="endDate"
                              value={formData.endDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  endDate: e.target.value,
                                })
                              }
                              className={formFieldClass}
                            />
                          </div>
                          {!formData.isAllDay && (
                            <div>
                              <label
                                htmlFor="endTime"
                                className={formLabelClass}
                              >
                                End Time *
                              </label>
                              <input
                                type="time"
                                id="endTime"
                                required
                                value={formData.endTime}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    endTime: e.target.value,
                                  })
                                }
                                className={formFieldClass}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className={formLabelClass}>
                          Description
                        </label>
                        <textarea
                          id="description"
                          rows={3}
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
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
                          onChange={(timezone) =>
                            setFormData({ ...formData, timezone })
                          }
                        />
                      </div>

                      {/* Recurring Event Toggle */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          checked={formData.isRecurring}
                          onChange={(e) => {
                            setIsTransitioning(true);
                            if (!e.target.checked) {
                              // Reset recurrence fields when unchecking
                              setFormData({
                                ...formData,
                                isRecurring: false,
                                recurrenceFrequency: "daily",
                                recurrenceDaysOfWeek: [],
                                recurrenceEndDate: "",
                              });
                            } else {
                              setFormData({ ...formData, isRecurring: true });
                            }
                          }}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="isRecurring"
                          className="text-sm font-medium"
                        >
                          Recurring event
                        </label>
                      </div>

                      {formData.isRecurring && (
                        <div className="space-y-4 rounded-md border border-zinc-300 p-4">
                          <div>
                            <label
                              htmlFor="recurrenceFrequency"
                              className={formLabelClass}
                            >
                              Frequency *
                            </label>
                            <select
                              id="recurrenceFrequency"
                              value={formData.recurrenceFrequency}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  recurrenceFrequency: e.target.value as
                                    | typeof DAILY
                                    | typeof WEEKLY
                                    | typeof MONTHLY,
                                })
                              }
                              className={formFieldClass}
                            >
                              <option value={DAILY}>{DAILY_TEXT}</option>
                              <option value={WEEKLY}>{WEEKLY_TEXT}</option>
                              <option value={MONTHLY}>{MONTHLY_TEXT}</option>
                            </select>
                          </div>

                          {formData.recurrenceFrequency === WEEKLY && (
                            <div>
                              <label className={formLabelClass}>
                                Repeat on *
                              </label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {DAYS.map((day: string, index: number) => {
                                  const isSelected =
                                    formData.recurrenceDaysOfWeek.includes(
                                      index
                                    );
                                  return (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={() => {
                                        const newDays = isSelected
                                          ? formData.recurrenceDaysOfWeek.filter(
                                              (d) => d !== index
                                            )
                                          : [
                                              ...formData.recurrenceDaysOfWeek,
                                              index,
                                            ].sort();
                                        setFormData({
                                          ...formData,
                                          recurrenceDaysOfWeek: newDays,
                                        });
                                      }}
                                      className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                                        isSelected
                                          ? "bg-black text-white"
                                          : "border border-zinc-300 hover:bg-zinc-100"
                                      }`}
                                    >
                                      {day.charAt(0)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div>
                            <label
                              htmlFor="recurrenceEndDate"
                              className={formLabelClass}
                            >
                              End Date (optional)
                            </label>
                            <input
                              type="date"
                              id="recurrenceEndDate"
                              value={formData.recurrenceEndDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  recurrenceEndDate: e.target.value,
                                })
                              }
                              className={formFieldClass}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(selectedEvent)}
                          disabled={isSaving}
                          className={`${buttonDeleteExpandedClass} ${
                            deleteClickedOnce ? "w-48" : "w-20"
                          }`}
                        >
                          {deleteClickedOnce
                            ? "Click again to delete"
                            : "Delete"}
                        </button>
                        <div className="flex gap-3">
                          <Dialog.Close asChild>
                            <button
                              type="button"
                              className={buttonCancelClass}
                              disabled={isSaving}
                            >
                              Cancel
                            </button>
                          </Dialog.Close>
                          <button
                            type="submit"
                            disabled={isSaving}
                            className={`${
                              isSaving ? buttonCancelClass : buttonPrimaryClass
                            } flex items-center gap-2`}
                          >
                            {isSaving && (
                              <UpdateIcon className="h-4 w-4 animate-spin" />
                            )}
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="delete-confirm"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                    className="space-y-4"
                  >
                    <Dialog.Title className="text-lg font-semibold">
                      Delete recurring event?
                    </Dialog.Title>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleDeleteThisOnly(selectedEvent)}
                        className="w-full rounded-md border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-100 text-left"
                      >
                        Delete this event only
                      </button>
                      <button
                        onClick={() => handleDeleteAll(selectedEvent)}
                        className="w-full rounded-md border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-100 text-left"
                      >
                        Delete all of these events
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="w-full flex gap-2 items-center rounded-md border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-medium hover:bg-zinc-100 text-left"
                      >
                        <ArrowLeftIcon /> Go Back
                      </button>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </AutoHeightAnimationWrapper>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
