import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { selectTriggerClass, selectContentClass, selectItemClass } from '@/lib/constants/styles';

interface TimezoneSelectProps {
  value: string;
  onChange: (timezone: string) => void;
}

const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'UTC', label: 'UTC' },
];

export default function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={selectTriggerClass}>
        <Select.Value />
        <Select.Icon>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={selectContentClass}>
          <Select.Viewport className="p-1">
            {COMMON_TIMEZONES.map((tz) => (
              <Select.Item key={tz.value} value={tz.value} className={selectItemClass}>
                <Select.ItemText>{tz.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
