## Scope

In order to limit the scope to something buildable given the timebox, I kept it to the requirements. A user should be able to do the following:

- **Manage company events**: Add, view, edit, delete (individual or multiple recurring events)
- **Timezone functionality**: Proper timezone handling for events
- **Event types**: Recurring / All day / Single event types
- **Monthly view** of calendar
- **Daily view** of calendar with more visual granularity of events
- **Date selector**: Select month, year, day
- **Toggle visibility** of events on the event type level
- **Mobile responsive** view
- **Suggest to sync to Google calendar**

## Some Decisions I Made

- I hardcoded the company event types to the few that were listed. Ideally as this scales, HR admins may need to customize the company events but for now we can just limit it and assume the HR admins are managing relatively smaller teams and only need the basics. A color picker for the event types would be nice too but for now I chose some boilerplate colors.

- I added a sync to gcal UI in the sidebar options but this is suggestive. I didn't have time to look into that implementation but I would imagine the HR admin would create several Google calendars and sync specific events to those specific calendars. People in their org can then subscribe to those calendars individually.

- Data is mocked, no fetching or mutating. I imagine they would have a lot more events than what is shown.

## UI Thoughts

- I saw one screenshot of the Warp UI on the landing page, so tried to make the sidebar and the aesthetics seem like they're at least in the same family.

- Couldn't pull all the fonts so stuck with one. Unfortunately I believe fonts can make or break the UI and I'm not the most pleased with this font choice but I'd rather not spend tons of time perusing font foundries or trying to scrape the exact fonts right now.

- Used radix components and icons for as many things as I could, since it has baked-in accessibility and great defaults. Couldn't use a calendar UI library so the date/time pickers in the add/edit modals are quite lackluster for now.

- A lot of this is tabbable, however the day cells are not. I'd like to get the day cells tabbable rather than the event pills, then keyboard navigation can be a lot easier I suspect.

- Used framer motion for a lot of this stuff. Modals, event details popovers, sidebar transitions. I wanted to make sure that clicking around felt relatively smooth.

## Other Things to Consider

- I'm wondering what the extreme case would be where there is an insane amount of events on the screen.

- I'm also wondering what the empty state could potentially show; empty calendar? Instructions?

- I imagine the people data could be fetched from existing endpoints. We could maybe use Sonner toasts to indicate success/error responses when creating/editing events.

- The calendar event types could maybe live in the settings part of the app, or we could think of a UI to allow admins to customize their event types as they grow.

- I'm also assuming that when they click on "Calendar" in the sidebar, it takes them to this calendar page and expands the menu.

- Tokens? I must admit I did not spend much time focusing on creating a consistent set of design tokens. Visually, I tried to make everything seem to match but ideally if we have a design system set up, then these values would be confidently consistent.

- Going from day view to month view can be a little jarring if you're on a different month and want to go to the current month, adding another button that says "This month" might be weird but it could simply be another state of the "Today" button. Or as part of a select menu there.

- When adding an event that overlaps with time off events, there might be a more elegant way to show that, currently it's rendering an alert banner for each person's event it overlaps with. If there are tons of people, then this UI would look wonky, so maybe after 3-4 people, it would just show a banner that says something like "Overlaps with 15 people's time off." Day views where there are a lot of time offs could benefit from this logic too, where we could show something like "15 people have time off" and then clicking on it shows a popover detailing all of the people who have time off. This would be great for not affecting the page layout.

## Approach

I got Claude Code to rip out a v1, I must say I am proud of my prompt for getting it super far on the first go. After this I went in and styled it, wired things up, made sure interactions felt good, and spent more time focusing on more of the details (like what happens when a user clicks on "Delete," for recurring events or single events, or what happens when the popover/modal need to change in height).

The code itself is straightforward, I used Jotai for state management because it's a tiny app and Jotai handles this well. Framer motion for most transitions. Radix for as many things as I could. Utilities, hooks, types, anything to consolidate as I was building to make it easier to find stuff.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Jotai
- **UI Components**: Radix UI
- **Date Utilities**: date-fns

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
│   ├── EventDetailsPopover.tsx  # Event details popover
│   ├── AddEventDialog.tsx  # Add event modal
│   ├── EditEventDialog.tsx # Edit event modal
│   ├── DeleteConfirmation.tsx # Delete confirmation dialog
│   ├── EventFilters.tsx    # Event type filter popover
│   ├── LeftSidebar.tsx     # Left sidebar navigation
│   └── form/               # Form components for event creation/editing
├── lib/
│   ├── types.ts            # TypeScript types and interfaces
│   ├── atoms.ts            # Jotai state atoms
│   ├── calendar-utils.ts   # Date and event utilities
│   ├── timezone-utils.ts   # Timezone conversion utilities
│   ├── mock-data.ts        # Sample event data
│   └── constants/          # Constants for event types, team members, etc.
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

## Event Types

The calendar supports multiple event types with color coding:

- **Meetings** (Gray)
- **Company Events** (Green)
- **Time Off** (Blue)
- **Birthdays** (Purple)
- **Work Anniversaries** (Gold)
- **Deadlines** (Red)


### Timezone & Time Off Features

- **UTC Storage**: All dates stored in UTC, converted to user's local timezone for display
  - **All-day events use noon UTC** to prevent date shifting across timezones
  - Example: Dec 15 12:00 UTC displays as Dec 15 in all timezones (UTC-12 to UTC+14)
  - Timed events converted from user's local timezone to UTC for storage
- **Timezone Detection**: Automatically detects and uses the user's timezone
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
- **Edge Case**: 15 people with time off from Christmas to New Year's

### Company Milestones
- Sarah's birthday (December 12)
- Mike's 2-year work anniversary (December 15)
- Product launch deadline (Friday, December 20, 5:00 PM)
- Company holiday party (December 19, 6:00 PM)
- Q1 2026 planning session (December 10)

### Various Meetings
- Design review, sprint planning, demo day