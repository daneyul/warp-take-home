import { DAYS } from '@/lib/constants/event-types';
import clsx from 'clsx';

interface WeekDaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export default function WeekDaySelector({ selectedDays, onChange }: WeekDaySelectorProps) {
  const toggleDay = (dayIndex: number) => {
    const isSelected = selectedDays.includes(dayIndex);
    const newDays = isSelected
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex].sort();
    onChange(newDays);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day, index) => {
        const isSelected = selectedDays.includes(index);
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(index)}
            className={clsx(
              'h-8 w-8 rounded-full text-xs font-medium transition-colors',
              isSelected
                ? 'bg-black text-white'
                : 'border border-zinc-300 hover:bg-zinc-100'
            )}
          >
            {day.charAt(0)}
          </button>
        );
      })}
    </div>
  );
}
