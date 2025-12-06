import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { CalendarEvent } from '@/lib/types';

interface DeleteConfirmationProps {
  event: CalendarEvent;
  onDeleteThis: (event: CalendarEvent) => void;
  onDeleteAll: (event: CalendarEvent) => void;
  onCancel: () => void;
  title?: string;
  titleClassName?: string;
}

export default function DeleteConfirmation({
  event,
  onDeleteThis,
  onDeleteAll,
  onCancel,
  title = 'Delete recurring event?',
  titleClassName = 'text-sm font-medium',
}: DeleteConfirmationProps) {
  return (
    <div className="space-y-3">
      <div className={titleClassName}>{title}</div>
      <div className="space-y-2">
        <button
          onClick={() => onDeleteThis(event)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 text-left"
        >
          Delete this event only
        </button>
        <button
          onClick={() => onDeleteAll(event)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 text-left"
        >
          Delete all of these events
        </button>
        <button
          onClick={onCancel}
          className="w-full flex gap-2 items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 text-left"
        >
          <ArrowLeftIcon /> Go Back
        </button>
      </div>
    </div>
  );
}
