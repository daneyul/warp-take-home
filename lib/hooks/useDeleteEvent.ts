import { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { allEventsAtom } from '../atoms';
import { CalendarEvent } from '../types';
import { extractBaseEventId } from '../utils/event-utils';
import { DELETE_CONFIRMATION_TIMEOUT } from '../constants/event-types';

export interface UseDeleteEventOptions {
  onDeleteComplete?: () => void;
}

export function useDeleteEvent(options: UseDeleteEventOptions = {}) {
  const [events, setEvents] = useAtom(allEventsAtom);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteClickedOnce, setDeleteClickedOnce] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleDeleteAll = useCallback(
    (event: CalendarEvent | null) => {
      if (!event) return;

      const { baseId } = extractBaseEventId(event.id);

      setEvents(events.filter((e) => e.id !== baseId));
      setShowDeleteConfirm(false);
      options.onDeleteComplete?.();
    },
    [events, setEvents, options]
  );

  const handleDeleteClick = useCallback(
    (event: CalendarEvent | null) => {
      if (!event) return;

      if (event.recurrence) {
        setIsTransitioning(true);
        setShowDeleteConfirm(true);
      } else {
        if (deleteClickedOnce) {
          handleDeleteAll(event);
        } else {
          setDeleteClickedOnce(true);
          setTimeout(() => {
            setDeleteClickedOnce(false);
          }, DELETE_CONFIRMATION_TIMEOUT);
        }
      }
    },
    [deleteClickedOnce, handleDeleteAll]
  );

  const handleDeleteThisOnly = useCallback(
    (event: CalendarEvent | null) => {
      if (!event) return;

      const { baseId, dateStr, isRecurringInstance } = extractBaseEventId(event.id);

      if (!isRecurringInstance || !dateStr) {
        handleDeleteAll(event);
        return;
      }

      const recurringEvent = events.find((e) => e.id === baseId);
      if (!recurringEvent || !recurringEvent.recurrence) {
        handleDeleteAll(event);
        return;
      }

      const updatedEvent = {
        ...recurringEvent,
        recurrence: {
          ...recurringEvent.recurrence,
          exceptions: [...(recurringEvent.recurrence.exceptions || []), dateStr],
        },
      };

      setEvents(events.map((e) => (e.id === baseId ? updatedEvent : e)));
      setShowDeleteConfirm(false);
      options.onDeleteComplete?.();
    },
    [events, setEvents, handleDeleteAll, options]
  );

  const handleCancelDelete = useCallback(() => {
    setIsTransitioning(true);
    setShowDeleteConfirm(false);
  }, []);

  const resetDeleteState = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteClickedOnce(false);
    setIsTransitioning(false);
  }, []);

  return {
    showDeleteConfirm,
    deleteClickedOnce,
    isTransitioning,
    setIsTransitioning,
    handleDeleteClick,
    handleDeleteAll,
    handleDeleteThisOnly,
    handleCancelDelete,
    resetDeleteState,
  };
}
