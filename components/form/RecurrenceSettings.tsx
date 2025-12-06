import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  formLabelClass,
  formFieldClass,
  selectTriggerClass,
  selectContentClass,
  selectItemClass,
} from "@/lib/constants/styles";
import WeekDaySelector from "./WeekDaySelector";
import { RecurrenceFrequency } from "@/lib/types";
import { DAILY, WEEKLY, MONTHLY, DAILY_TEXT, WEEKLY_TEXT, MONTHLY_TEXT } from "@/lib/constants/event-types";

interface RecurrenceSettingsProps {
  frequency: RecurrenceFrequency;
  daysOfWeek: number[];
  endDate: string;
  onFrequencyChange: (frequency: RecurrenceFrequency) => void;
  onDaysOfWeekChange: (days: number[]) => void;
  onEndDateChange: (date: string) => void;
  useNativeSelect?: boolean;
}

export default function RecurrenceSettings({
  frequency,
  daysOfWeek,
  endDate,
  onFrequencyChange,
  onDaysOfWeekChange,
  onEndDateChange,
  useNativeSelect = false,
}: RecurrenceSettingsProps) {
  return (
    <div className="space-y-4 rounded-md border border-zinc-300 p-4">
      <div>
        <label htmlFor="recurrenceFrequency" className={formLabelClass}>
          Frequency *
        </label>
        {useNativeSelect ? (
          <select
            id="recurrenceFrequency"
            value={frequency}
            onChange={(e) =>
              onFrequencyChange(e.target.value as RecurrenceFrequency)
            }
            className={formFieldClass}
          >
            <option value={DAILY}>{DAILY_TEXT}</option>
            <option value={WEEKLY}>{WEEKLY_TEXT}</option>
            <option value={MONTHLY}>{MONTHLY_TEXT}</option>
          </select>
        ) : (
          <Select.Root
            value={frequency}
            onValueChange={onFrequencyChange}
            required
          >
            <Select.Trigger
              id="recurrenceFrequency"
              className={selectTriggerClass}
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={selectContentClass}>
                <Select.Viewport className="p-1">
                  <Select.Item value={DAILY} className={selectItemClass}>
                    <Select.ItemText>{DAILY_TEXT}</Select.ItemText>
                  </Select.Item>
                  <Select.Item value={WEEKLY} className={selectItemClass}>
                    <Select.ItemText>{WEEKLY_TEXT}</Select.ItemText>
                  </Select.Item>
                  <Select.Item value={MONTHLY} className={selectItemClass}>
                    <Select.ItemText>{MONTHLY_TEXT}</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        )}
      </div>

      {frequency === WEEKLY && (
        <div>
          <label className={formLabelClass}>Repeat on *</label>
          <div className="mt-2">
            <WeekDaySelector
              selectedDays={daysOfWeek}
              onChange={onDaysOfWeekChange}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="recurrenceEndDate" className={formLabelClass}>
          End Date (optional)
        </label>
        <input
          type="date"
          id="recurrenceEndDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className={formFieldClass}
        />
      </div>
    </div>
  );
}
