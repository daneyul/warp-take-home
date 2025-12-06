import {
  formLabelClass,
  formFieldClass,
  formFieldErrorClass,
  formErrorMessageClass,
} from '@/lib/constants/styles';

interface DateTimeInputGroupProps {
  label: string;
  dateId: string;
  timeId?: string;
  dateValue: string;
  timeValue?: string;
  onDateChange: (value: string) => void;
  onTimeChange?: (value: string) => void;
  isAllDay: boolean;
  dateRequired?: boolean;
  timeRequired?: boolean;
  dateError?: string;
  timeError?: string;
}

export default function DateTimeInputGroup({
  label,
  dateId,
  timeId,
  dateValue,
  timeValue = '',
  onDateChange,
  onTimeChange,
  isAllDay,
  dateRequired = false,
  timeRequired = false,
  dateError,
  timeError,
}: DateTimeInputGroupProps) {
  return (
    <div className={isAllDay ? 'flex-1' : 'grid grid-cols-2 gap-3'}>
      <div>
        <label htmlFor={dateId} className={formLabelClass}>
          {label} {dateRequired && '*'}
        </label>
        <input
          type="date"
          id={dateId}
          required={dateRequired}
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          className={dateError ? formFieldErrorClass : formFieldClass}
        />
        {dateError && <p className={formErrorMessageClass}>{dateError}</p>}
      </div>
      {!isAllDay && timeId && onTimeChange && (
        <div>
          <label htmlFor={timeId} className={formLabelClass}>
            {label.replace('Date', 'Time')} {timeRequired && '*'}
          </label>
          <input
            type="time"
            id={timeId}
            required={timeRequired}
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            className={timeError ? formFieldErrorClass : formFieldClass}
          />
          {timeError && <p className={formErrorMessageClass}>{timeError}</p>}
        </div>
      )}
    </div>
  );
}
