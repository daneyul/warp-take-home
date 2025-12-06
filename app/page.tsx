'use client';

import { useAtom } from 'jotai';
import { viewModeAtom } from '@/lib/atoms';
import CalendarHeader from '@/components/CalendarHeader';
import MonthView from '@/components/MonthView';
import DayView from '@/components/DayView';
import EditEventDialog from '@/components/EditEventDialog';
import LeftSidebar from '@/components/LeftSidebar';
import { DAY, MONTH } from '@/lib/constants/event-types';

export default function Home() {
  const [viewMode] = useAtom(viewModeAtom);

  return (
    <>
      <EditEventDialog />
      <div className="flex h-screen">
        <LeftSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className="flex flex-1 flex-col overflow-hidden bg-white border-zinc-300"
          >
            <CalendarHeader />
            <div className="flex-1 overflow-auto">
              {viewMode === MONTH && <MonthView />}
              {viewMode === DAY && <DayView />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
