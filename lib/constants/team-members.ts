export interface Department {
  name: string;
  members: string[];
}

export const DEPARTMENTS: Department[] = [
  {
    name: 'Engineering',
    members: ['Sarah Chen', 'Alex Kim', 'Jordan Lee'],
  },
  {
    name: 'Operations',
    members: ['Emma Wilson', 'Marcus Rodriguez'],
  },
  {
    name: 'Design',
    members: ['Riley Patel', 'Taylor Morgan'],
  },
];

export const ALL_TEAM_MEMBERS = DEPARTMENTS.flatMap(dept => dept.members);
