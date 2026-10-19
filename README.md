# Flintzy — Social Media Post Scheduler

A responsive, frontend-only social media scheduling dashboard built with React, TypeScript and Redux Toolkit. Creators can compose posts for Facebook, Instagram, X and TikTok, schedule them, see them in a day-grouped queue or a month calendar, filter and search them, and retry failed posts.

## 📋 Project Description

There are no real social integrations or logins. All data and API calls are mocked: a mock API simulates network latency and failures, and posts are saved in the browser's `localStorage`. It still behaves like a real app. You can schedule posts, retry failed ones with optimistic updates and rollback, share filtered views by URL, and refresh without losing anything.

### Live Link

https://flintzy-assignment.vercel.app/queue

### Repository

https://github.com/sarthakastic/FlintzyAssignment

### Key Highlights

- **Queue grouped by day**: Today, Tomorrow, upcoming dates, then an "Earlier" section for past days
- **Calendar view**: Month grid showing each day's posts, colour-coded by status
- **URL-driven filters**: Platform, status and search survive refreshes, shareable links and back/forward
- **Per-platform character limits**: Live counters; scheduling is blocked while any platform is over its limit
- **Correct time zones**: Picked in local time, stored in UTC, always displayed in local time
- **Optimistic retry with rollback**: 1-second mock request that fails 20% of the time
- **Dark mode by default**: Light/dark toggle, remembered per browser
- **Accessible and responsive**: Keyboard navigation, screen-reader labels, layouts for mobile, tablet and desktop

## 🛠️ Tech Stack

### Core Technologies

- **React 19** - Function components and hooks
- **TypeScript 6** - Strict typing throughout (`noUnusedLocals`, `noUnusedParameters`)
- **Redux Toolkit 2.13** + **React Redux 9.3** - Shared post state, async thunks, optimistic updates
- **React Router 7.18** - Routing and URL query parameters
- **Vite 6.4** - Development server and production build

### Styling

- **Tailwind CSS 4.3** - Utility-first styling with light/dark theme tokens defined as CSS variables
- **shadcn/ui primitives** - `Button` and `Input` (built on `radix-ui` and `class-variance-authority`)
- **Lucide React** - Icons
- **Geist Variable** - Typeface

### Development Tools

- **ESLint 9** with `typescript-eslint`, `react-hooks` and `react-refresh` plugins

> No backend, database, environment variables or API keys are required.

## ✨ Features

### 1. Post Queue (`/queue`)

- **Grouped by local day**: Today, Tomorrow, then upcoming dates in order, followed by an **Earlier** section (most recent past day first, with "Yesterday")
- **Post cards**: Content preview, optional image thumbnail, platform icons, local time and status badge
- **Failed posts**: Show their error message and a **Retry** button
- **States**: Loading skeleton, empty queue, "no posts match your filters", and a load error with **Retry** and **Reset demo data**
- **Dashboard panel** (wide screens): Mini calendar with post markers (each day opens in the calendar view), status counts that link to filters, and a character-limit reference

### 2. Calendar View (`/calendar`)

- **Month grid**: Each day shows its posts as colour-coded chips (green scheduled, blue published, red failed) with time and preview, plus "+N more"; phones show coloured dots
- **Day list**: Selecting a day lists its posts below the grid, using the same cards (Retry works here too)
- **Shareable**: The selected day is in the URL (`?date=2026-10-21`), alongside any filters
- **Keyboard**: Arrow keys move between days, Page Up/Down change month, Home/End jump to week start/end
- **Schedule from a day**: "Schedule a post" opens the composer set to that day; after scheduling you return to it
- **Same filters**: The List/Calendar switch keeps the active filters

### 3. Search & Filters

- **Search** by content, case-insensitive, debounced by 300 ms
- **Platform filter**: Facebook, Instagram, X, TikTok (multi-platform posts match any of their platforms)
- **Status filter**: Scheduled, Published, Failed
- **URL query parameters**: `?platform=x&status=failed&search=launch`. Invalid values are cleaned up, typing replaces history instead of adding entries, and unrelated parameters are kept
- **Clear filters** resets everything in one click

### 4. Post Composer (`/compose`)

- **Content** with a live preview
- **Platform selection**: Toggle one or more platforms
- **Live character counters** for each selected platform:

  | Platform  | Limit |
  | --------- | ----: |
  | X         |   280 |
  | Instagram | 2,200 |
  | TikTok    | 2,200 |
  | Facebook  | 5,000 |

- **Optional image URL** with preview and graceful handling of broken images
- **Date & time picker** (centered modal):
  - Quick picks: _In 1 hour_, _Tomorrow morning_, _Tomorrow evening_, _Next Monday_
  - Calendar with past days disabled and keyboard navigation
  - Hour/minute selects in 5-minute steps (12- or 24-hour depending on the browser's locale), with past times disabled
  - Close button, Done, Escape or backdrop click to close
- **Validation**: Non-empty content, at least one platform, within every selected platform's limit, valid http(s) image URL, and a time strictly in the future. It runs again on submit, and the mock API validates again
- **Submission**: Duplicate submits are prevented, your input is kept if the request fails, and you return to the queue with a confirmation

### 5. Retry Failed Posts

1. Clicking **Retry** updates the card immediately (optimistic update)
2. The mock API waits **1 second** and fails **20%** of the time
3. **Success**: The post is re-queued. It becomes _scheduled_ if its time is still ahead, or _published_ if the time has already passed, and the old error is cleared
4. **Failure**: The post rolls back to _failed_ with its **original** error message, and a dismissible notice names the post
5. Only the confirmed result is written to `localStorage`, so a failed retry never changes saved data. Retries on different posts run independently, and duplicate clicks are ignored

### 6. Additional Features

- **Dark mode by default** with a light/dark toggle, applied before first paint so there's no flash
- **Mock publishing**: Scheduled posts whose time has passed become _published_ when posts load and every 30 seconds
- **Multi-tab sync**: Other open tabs reload when posts change
- **Responsive navigation**: Full sidebar on desktop, an icon rail on tablets and a menu panel on phones

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v20 or higher (developed on v20.18)
- **npm**

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/sarthakastic/FlintzyAssignment.git
   cd FlintzyAssignment
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in the terminal). The first visit seeds 36 demo posts.

> No `.env` file is needed. All data is mocked in the browser.

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Type-check (`tsc -b`) and build for production into `dist/`
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

### Resetting the Demo Data

Delete the `flintzy.posts.v1` key from `localStorage` in DevTools and refresh. If saved data is ever corrupted, the error screen offers **Reset demo data**.

## 🧠 Key Decisions

### State & Data

- **Redux Toolkit for shared post state.** The queue, calendar, sidebar counts, dashboard panel and composer all read the same posts. Async thunks give consistent loading and error states, and the slice is a natural place for optimistic updates and rollback.
- **A mock API layer in front of `localStorage`.** Components never touch storage directly. `mockPostsApi` adds latency, validation and random failures like a real server would, and `storageService` validates everything it reads. That makes it possible to swap in a real backend later without touching the UI.
- **Seed data created relative to "now".** The 36 demo posts are generated on first load, so there are always posts for today and the coming days, whenever the app is opened.
- **Saved data is validated, never silently overwritten.** If stored data is malformed, the app shows an error with Retry and an explicit **Reset demo data** button instead of reseeding over the user's posts.
- **Only confirmed results are persisted.** Loading indicators, retry-in-progress IDs and optimistic changes live only in Redux. `localStorage` always matches what the mock server confirmed.

### Time Zones

- **Store UTC, display local.** `scheduledAt` is always an ISO UTC string in Redux and storage, never a `Date` object.
- **Convert exactly once.** The picker works with local wall-clock values (`YYYY-MM-DDTHH:MM`), which are parsed into their parts and built with the local `Date` constructor. Times that don't exist (skipped by a DST change) are rejected. The value is checked to be in the future and converted once with `toISOString()` on submit. `Z` is never appended to a local time.
- **Group by local day.** The queue and calendar group posts by the browser's calendar day, so a post at 00:30 UTC shows on the correct day in every time zone.

### Retry Semantics

- **Optimistic, with a per-request snapshot.** The original status and error are saved with the request ID, so a late or out-of-order response can't restore stale data.
- **"Re-queue" rather than "always scheduled".** A successful retry of a post whose time has passed is confirmed as _published_. This avoids leaving "scheduled" posts in the past.
- **Per-post error notices.** Concurrent failures don't overwrite each other, and each notice names its post.
- **The card stays visible under the "Failed" filter while its retry is in flight**, so it doesn't vanish and reappear on rollback.

### URL as the Source of Truth for Views

- Filters (`platform`, `status`, `search`) and the calendar's `date` live in the URL, so any view can be bookmarked, shared or refreshed. Typing in search is debounced and uses history _replace_. Dropdown changes push to history, so back and forward undo them.

### UX & Accessibility

- **Native `<select>` filters** instead of custom dropdowns, for correct semantics, keyboard support and the system pickers on mobile.
- **Custom date-time picker as a centered modal.** The native `datetime-local` input looks different in every browser and is hard to use on desktop. The modal adds quick picks, disables past times, locks page scroll, keeps keyboard focus inside and returns focus to the field when it closes.
- **Theme tokens instead of hard-coded colours.** Light and dark palettes are CSS variables, and contrast was checked in both modes. Status is never shown by colour alone: every chip and badge has text or an accessible label.
- **Only working controls.** Placeholder pages, dead buttons and filler cards were removed instead of being left as non-functional decoration.
- Reduced-motion preferences are respected, focus states are visible, and icon-only buttons have accessible names.

### Scope

- **No automated test framework**, by choice for this assignment. Correctness was checked manually in the browser (see below) along with the type-checked build and lint.
- **No extra libraries** for dates, forms or UI kits. The native `Intl` and `Date` APIs plus small helpers (`src/lib/dates.ts`, `src/features/posts/scheduleTime.ts`) cover everything needed.

## ✅ Verification

Every change was checked with `npm run build` (including `tsc -b`) and `npm run lint`, plus manual browser checks of:

- The queue loads the demo data, grouped and ordered correctly, with Today first
- Search, platform and status filters update the URL and survive refresh and back/forward
- Character limits per selected platform block scheduling when exceeded
- Past times can't be picked, and local times are saved as UTC (e.g. 18:00 IST → `12:30Z`)
- New posts appear in the queue and calendar at the correct local time
- Retry: optimistic update, success persists, failure rolls back with the original error (both outcomes forced)
- Past-due scheduled posts become published, and corrupted storage offers a reset
- Calendar day selection, keyboard navigation, month paging and "Schedule a post"
- Light and dark themes at phone (375 px), mid-size (about 800–1024 px) and desktop (1440 px) widths, with no horizontal scrolling

## 🏗️ Project Architecture

### Directory Structure

```
src/
├── app/                     # Store, typed hooks, providers, routes
│
├── components/
│   ├── dashboard/           # Mini calendar, status overview, character limits
│   ├── layout/              # App shell, sidebar, top bar, theme toggle
│   ├── queue/               # Post card, date group, status badge, platform icon,
│   │                        # loading / empty / no-results / error states, retry notices
│   └── ui/                  # Button and Input primitives
│
├── features/
│   ├── posts/               # Types, slice, thunks, selectors, validation,
│   │   │                    # time utilities, composer page
│   │   └── components/      # Platform selector, date-time picker
│   ├── queue/               # Queue page, toolbar, view switcher, URL filter hooks
│   └── calendar/            # Month calendar page
│
├── lib/                     # Platform config, date helpers, theme, navigation, utils
│
├── services/                # Mock API, localStorage service, seed data
│
├── index.css                # Tailwind setup, light/dark theme tokens
└── main.tsx                 # Application entry point
```

### Routes

| Path        | Page                                              |
| ----------- | ------------------------------------------------- |
| `/queue`    | Day-grouped post queue (default; `/` redirects)   |
| `/calendar` | Month calendar with day list                      |
| `/compose`  | Post composer (`?date=YYYY-MM-DD` pre-sets a day) |

Legacy `/published` and `/failed` links redirect to the queue with that status filter. Unknown paths redirect to the queue.

### Redux Store Structure

```ts
{
  posts: {
    items: Post[],                  // Canonical post collection
    loading: boolean,               // Initial load / reload in flight
    initialized: boolean,           // First load completed
    error: string | null,           // Load error
    creating: boolean,              // Create request in flight
    retryingIds: string[],          // Posts with a retry in flight
    retrySnapshots: Record<id, { requestId, status, errorMessage }>, // For rollback
    retryErrors: Record<id, string> // Failed-retry notices per post
  }
}
```

### Post Model

```ts
interface Post {
  id: string;
  content: string;
  platforms: ("facebook" | "instagram" | "x" | "tiktok")[];
  mediaUrl?: string;
  scheduledAt: string; // ISO 8601 UTC
  status: "scheduled" | "published" | "failed";
  errorMessage?: string; // failed posts only
}
```

### Async Operations

| Thunk             | Mock behaviour                                                        |
| ----------------- | --------------------------------------------------------------------- |
| `fetchPosts`      | ~500 ms; seeds on first visit; publishes past-due posts               |
| `createPost`      | ~500 ms; re-validates content, platforms, limits, URL and future time |
| `retryPost`       | 1 s; fails 20% of the time; optimistic update with rollback           |
| `publishDuePosts` | Every 30 s; flips past-due scheduled posts to published               |
| `resetPosts`      | ~500 ms; replaces saved data with fresh demo posts                    |

### Component Hierarchy

```
App
└── AppShell (sidebar, top bar, theme toggle, background jobs)
    ├── QueuePage
    │   ├── QueueToolbar (filters, search, ViewSwitcher)
    │   ├── RetryErrorList
    │   ├── DateGroup → PostCard (multiple)
    │   └── MiniCalendar · PostOverview · SupportedPlatforms
    ├── CalendarPage
    │   ├── QueueToolbar
    │   ├── Month grid
    │   └── DateGroup → PostCard (selected day)
    └── ComposePage
        ├── PlatformSelector
        └── SchedulePicker (modal)
```

### Data Flow

1. **Initial load**: AppShell → `fetchPosts` → mock API → `localStorage` (seed if empty) → Redux → views
2. **Filtering**: URL query params → `useQueueFilters` → `useVisiblePosts` → grouped by day → queue or calendar
3. **Create**: Composer → validation → local time to UTC → `createPost` → mock API → `localStorage` → Redux
4. **Retry**: PostCard → `retryPost` → optimistic update → mock API (1 s, 20% fail) → confirm, or roll back from snapshot

## 🌐 Deployment

The app is a static single-page app. `vercel.json` (Vercel) and `public/_redirects` (Netlify) send every path to `index.html`, so deep links like `/calendar?date=2026-10-21` work on refresh.

- **Build command:** `npm run build`
- **Output directory:** `dist`

## 📝 Additional Notes

### Accessibility

- Semantic headings, landmarks, buttons and links
- Full keyboard support, including arrow-key navigation in both calendars and focus kept inside the modal
- Visible focus rings and accessible names for icon-only controls
- Status is never shown by colour alone
- Respects `prefers-reduced-motion`

### Browser Support

- Recent versions of Chrome, Firefox, Safari and Edge
- Responsive layouts for mobile, tablet and desktop

### Known Limitations

- Data lives only in the current browser; there is no server or account
- Character counts use JavaScript string length (UTF-16 units); real platforms count some characters, such as URLs, differently
- Posts cannot be edited or deleted after scheduling, and there are no drafts
