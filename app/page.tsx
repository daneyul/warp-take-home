'use client';

import { useAtom } from 'jotai';
import { viewModeAtom } from '@/lib/atoms';
import CalendarHeader from '@/components/CalendarHeader';
import MonthView from '@/components/MonthView';
import DayView from '@/components/DayView';
import EditEventDialog from '@/components/EditEventDialog';
import LeftSidebar from '@/components/LeftSidebar';

export default function Home() {
  const [viewMode] = useAtom(viewModeAtom);

  return (
    <>
      <EditEventDialog />
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Calendar Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className="flex flex-1 flex-col overflow-hidden bg-white"
            style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}
          >
            <CalendarHeader />
            <div className="flex-1 overflow-auto">
              {viewMode === 'month' && <MonthView />}
              {viewMode === 'day' && <DayView />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
