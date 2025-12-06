import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { DEPARTMENTS } from '@/lib/constants/team-members';
import {
  selectTriggerClass,
  selectContentClass,
  selectItemClass,
  selectLabelClass,
  selectSeparatorClass,
} from '@/lib/constants/styles';

interface PersonSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
}

export default function PersonSelect({ value, onValueChange, id }: PersonSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger id={id} className={selectTriggerClass}>
        <Select.Value placeholder="Select person" />
        <Select.Icon>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={selectContentClass}>
          <Select.Viewport className="p-1">
            {DEPARTMENTS.map((department, index) => (
              <div key={department.name}>
                <Select.Group>
                  <Select.Label className={selectLabelClass}>{department.name}</Select.Label>
                  {department.members.map((member) => (
                    <Select.Item key={member} value={member} className={selectItemClass}>
                      <Select.ItemText>{member}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Group>
                {index < DEPARTMENTS.length - 1 && (
                  <Select.Separator className={selectSeparatorClass} />
                )}
              </div>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
