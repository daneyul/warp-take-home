'use client';

import { useAtom } from 'jotai';
import { viewModeAtom } from '@/lib/atoms';
import CalendarHeader from '@/components/CalendarHeader';
import MonthView from '@/components/MonthView';
import WeekView from '@/components/WeekView';
import DayView from '@/components/DayView';
import EditEventDialog from '@/components/EditEventDialog';
import LeftSidebar from '@/components/LeftSidebar';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';

export default function Home() {
  const [viewMode] = useAtom(viewModeAtom);

  return (
    <>
      <KeyboardShortcuts />
      <EditEventDialog />
      <div className="flex h-screen" style={{ backgroundColor: '#EEEEEE' }}>
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Calendar Area */}
        <div className="flex flex-1 flex-col overflow-hidden p-2">
          <div
            className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-white"
            style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}
          >
            <CalendarHeader />
            <div className="flex-1 overflow-auto">
              {viewMode === 'month' && <MonthView />}
              {viewMode === 'week' && <WeekView />}
              {viewMode === 'day' && <DayView />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
