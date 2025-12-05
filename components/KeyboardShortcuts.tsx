'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { viewModeAtom, currentDateAtom, selectedEventAtom } from '@/lib/atoms';
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';

export default function KeyboardShortcuts() {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Close sidebar with Escape
      if (e.key === 'Escape' && selectedEvent) {
        e.preventDefault();
        setSelectedEvent(null);
        return;
      }

      // Navigate to today with 't'
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setCurrentDate(new Date());
        return;
      }

      // Switch views with 'm', 'w', 'd'
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setViewMode('month');
        return;
      }
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setViewMode('week');
        return;
      }
      if ((e.key === 'd' || e.key === 'D') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setViewMode('day');
        return;
      }

      // Navigate with arrow keys
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (viewMode === 'month') {
          setCurrentDate(subMonths(currentDate, 1));
        } else if (viewMode === 'week') {
          setCurrentDate(subWeeks(currentDate, 1));
        } else {
          setCurrentDate(subDays(currentDate, 1));
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (viewMode === 'month') {
          setCurrentDate(addMonths(currentDate, 1));
        } else if (viewMode === 'week') {
          setCurrentDate(addWeeks(currentDate, 1));
        } else {
          setCurrentDate(addDays(currentDate, 1));
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentDate, selectedEvent, setViewMode, setCurrentDate, setSelectedEvent]);

  return null;
}
