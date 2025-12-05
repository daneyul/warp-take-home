# Warp Calendar

A modern, polished calendar interface for managing work-related events, built with Next.js, React, and TypeScript.

## Features

### Core Functionality

- **Multiple View Modes**: Switch between Month, Week, and Day views
- **Event Management**: Add, view, edit, and delete events with a clean UI
- **Event Types**: Support for multiple event types with color coding
  - Meetings (Gray)
  - Company Events (Green)
  - Time Off (Blue)
  - Birthdays (Purple)
  - Work Anniversaries (Gold)
  - Deadlines (Red)

### Advanced Features

- **Recurring Events**: Support for daily and weekly recurring events
- **Multi-day Events**: Events that span multiple days are displayed correctly across all views
- **Event Filtering**: Filter events by type using the filter dropdown
- **Sidebar Details**: Click any event to view full details in the sidebar
- **Today Indicator**: Quickly identify today's date in all views
- **Keyboard Shortcuts**: Efficient navigation for power users

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `←` `→` | Navigate between months/weeks/days |
| `T` | Go to today |
| `M` | Switch to month view |
| `W` | Switch to week view |
| `D` | Switch to day view |
| `Esc` | Close sidebar or dialog |
| `?` | Show keyboard shortcuts help |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Jotai
- **UI Components**: Radix UI
- **Date Utilities**: date-fns
- **Font**: Inter (Google Fonts)

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with Inter font
│   ├── page.tsx            # Main calendar page
│   └── globals.css         # Global styles
├── components/
│   ├── CalendarHeader.tsx  # Header with navigation and view switcher
│   ├── MonthView.tsx       # Month calendar grid
│   ├── WeekView.tsx        # Week view with hourly grid
│   ├── DayView.tsx         # Day view with detailed hourly slots
│   ├── EventSidebar.tsx    # Event details sidebar
│   ├── AddEventDialog.tsx  # Add event modal
│   ├── EventFilters.tsx    # Event type filter popover
│   ├── KeyboardShortcuts.tsx      # Keyboard navigation handler
│   └── KeyboardShortcutsHelp.tsx  # Shortcuts help dialog
├── lib/
│   ├── types.ts            # TypeScript types and interfaces
│   ├── atoms.ts            # Jotai state atoms
│   ├── calendar-utils.ts   # Date and event utilities
│   └── mock-data.ts        # Sample event data
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Design Decisions

### State Management

- **Jotai** was chosen for its simplicity and atomic state model
- Derived atoms used for computed values (e.g., filtered events)
- Minimal boilerplate compared to Redux

### Styling Approach

- **Tailwind CSS 4** for utility-first styling
- Consistent color palette for event types
- Smooth transitions and hover states for better UX
- Responsive grid layouts without external calendar libraries

### Component Architecture

- **Radix UI** for accessible, unstyled components (Tabs, Dialog, Popover, Checkbox)
- Custom calendar grid implementation (no external calendar libraries per requirements)
- Separation of concerns: views, utilities, and state management

### UX Optimizations

- **Keyboard shortcuts** for power users (HR admins)
- **Today indicator** for quick orientation
- **Filter with visual feedback** (badge count)
- **Smooth transitions** on hover and interactions
- **Side panel** instead of modals to maintain calendar context

### Timezone & Time Off Features

- **UTC Storage**: All dates stored in UTC, converted to user's local timezone for display
  - **All-day events use noon UTC** to prevent date shifting across timezones
  - Example: Dec 15 12:00 UTC displays as Dec 15 in all timezones (UTC-12 to UTC+14)
  - Timed events converted from user's local timezone to UTC for storage
- **Timezone Detection**: Automatically detects and uses the user's timezone
- **Partial Day Time Off**: Support for half-day or custom hour time off requests
  - Visual indicators (⏱ icon and left border) to distinguish partial from full days
  - Displays specific hours (e.g., "8:00am Jordan - Out (Morning)")
- **Overlapping Time Off**: Shows multiple people's PTO on the same day
  - Example: Emma and Alex both off on Dec 16
  - Stacked event display for easy visibility
- **Time Off Types**:
  - Full day: All-day events spanning one or more days
  - Partial day: Specific hour ranges (morning appointments, afternoon leave, etc.)

## Mock Data

The calendar includes sample data demonstrating (December 2025):

### Recurring Events
- Daily recurring standup (9:00 AM every day in December 2025)
- Weekly all-hands meeting (Mondays at 10:00 AM)

### Time Off Scenarios
- **Full Day PTO**: Emma out Dec 16-17 (2 consecutive days)
- **Overlapping PTO**: Alex also out Dec 16 (same day as Emma)
- **Partial Day - Morning**: Jordan out Dec 18, 8:00 AM - 12:00 PM
- **Partial Day - Afternoon**: Sam out Dec 19, 1:00 PM - 5:00 PM

### Company Milestones
- Sarah's birthday (December 12)
- Mike's 2-year work anniversary (December 15)
- Product launch deadline (Friday, December 20, 5:00 PM)
- Company holiday party (December 19, 6:00 PM)
- Q1 2026 planning session (December 10)

### Various Meetings
- Design review, sprint planning, demo day

## Future Enhancements

Potential improvements for production:

- [ ] Google Calendar sync integration
- [ ] Conflict detection (warn when scheduling meetings during PTO)
- [ ] Team/person filtering (filter calendar by department or individual)
- [ ] Drag-and-drop event editing
- [ ] Multi-timezone display (show events in multiple timezones simultaneously)
- [ ] Event search and autocomplete
- [ ] Mobile responsive optimizations
- [ ] Dark mode support
- [ ] Export to ICS format
- [ ] Notification reminders
- [ ] PTO approval workflow (pending/approved states)
- [ ] PTO balance tracking (days remaining per person)
- [ ] Capacity planning (too many people off warning)

## License

MIT
