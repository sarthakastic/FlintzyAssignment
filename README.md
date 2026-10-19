# Flintzy — Social Media Post Scheduler

A frontend-only scheduling dashboard for composing, scheduling and managing posts across Facebook, Instagram, X and TikTok. All data and API calls are mocked; no social accounts or credentials are needed.

**Live demo:** _add the deployed URL here_

## Features

- **Post queue grouped by day** — Today, Tomorrow, then upcoming dates in chronological order, followed by an "Earlier" section with past days (most recent first). Each card shows a content preview, optional image, platform icons, local scheduled time and status.
- **Calendar view** (`/calendar`) — a month grid with each day's posts as colour-coded chips (dots on phones). Selecting a day lists its posts below, with retry for failed ones. The selected day is in the URL (`?date=2026-10-20`), arrow keys move between days, and "Schedule a post" opens the composer pre-set to that day. The same filters apply, and the List/Calendar switch keeps them.
- **Search and filters** — search by content (case-insensitive, debounced), filter by platform and status. Filters live in the URL (`?platform=x&status=failed&search=launch`), so they survive refreshes, can be shared, and work with back/forward.
- **Composer** (`/compose`) — text, multi-platform selection, optional image URL with preview, and a date-time picker with quick picks (in 1 hour, tomorrow morning/evening, next Monday), a calendar and hour/minute selects. Past times can't be picked.
- **Light and dark themes** — dark by default; the toggle in the top bar is remembered per browser.
- **Live per-platform character counters** — X 280, Instagram 2,200, TikTok 2,200, Facebook 5,000. Scheduling is blocked while any selected platform is over its limit.
- **Future-only scheduling in UTC** — the picked local time must be in the future; it is stored as a UTC ISO timestamp and always displayed in the browser's time zone.
- **Optimistic retry for failed posts** — the card updates immediately, the mock API waits 1 second and fails 20% of the time; on failure the post rolls back to its original failed state and error message, and a dismissible error is shown.
- **Loading, empty, no-results and error states**, and a responsive layout for mobile, tablet and desktop.

## Tech stack

React 19, TypeScript, Vite, Redux Toolkit + React Redux, React Router, Tailwind CSS v4, shadcn/ui primitives, Lucide icons. No backend.

## Getting started

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

| Script            | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite development server         |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally        |
| `npm run lint`    | Run ESLint                                |

## How the mock backend works

- **Seed data** — `src/services/mockData.ts` contains 36 posts (scheduled, published and failed; single- and multi-platform; with and without images). Timestamps are generated relative to the moment of first load so the queue always has posts for today and the coming days.
- **Persistence** — posts are stored in `localStorage` under `flintzy.posts.v1`. The first visit seeds the data; later visits load what is saved. Stored data is validated on read; if it is corrupt, the error state offers **Retry** and **Reset demo data**. To start over manually, delete that key in DevTools and refresh.
- **Mock API** — `src/services/mockPostsApi.ts` simulates network latency (~500 ms for loads and creates, 1 s for retries) and re-validates input (content, platforms, character limits, future time, image URL) the way a real server would.
- **Publishing** — a scheduled post whose time has passed is treated as published. This is checked when posts are loaded and every 30 seconds while the app is open.
- **Retry** — retrying a failed post re-queues it. If its scheduled time is still ahead it becomes *scheduled*; if the time has already passed it goes out immediately and becomes *published*. Only the confirmed result is written to `localStorage`; a failed retry never changes stored data.
- **Multiple tabs** — tabs listen for `storage` events and reload when another tab changes the posts.

## Time zone handling

The composer's `datetime-local` value is a wall-clock time in the browser's zone. It is parsed into its parts and built with the local `Date` constructor (rejecting impossible times, such as those skipped by a DST change), checked to be in the future, then converted once with `toISOString()`. Redux and `localStorage` only ever hold UTC ISO strings. The queue formats times with `Intl.DateTimeFormat` and groups by the **local** calendar day, so a post at 00:30 UTC lands on the correct local day for every time zone.

## Project structure

```
src/
  app/          store, typed hooks, providers, routes
  components/   layout (shell, sidebar, top bar), queue UI, dashboard widgets, ui primitives
  features/
    posts/      types, slice, thunks, selectors, validation, time utils, composer
    queue/      queue page, toolbar, view switcher, URL-synced filter hooks
    calendar/   month calendar view and date helpers
  lib/          platform config (character limits), navigation, helpers
  services/     mock API, localStorage service, seed data
```

## Deployment

The app is a static SPA. `vercel.json` (Vercel) and `public/_redirects` (Netlify) rewrite every path to `index.html` so deep links such as `/compose` or `/queue?status=failed` work on refresh. Build command: `npm run build`; output directory: `dist`.

## Known limitations

- No real social integrations, authentication or server; data lives only in the current browser.
- Character counts use JavaScript string length (UTF-16 units). Real platforms weigh URLs and some characters differently.
- Posts cannot be edited or deleted after scheduling, and there are no drafts.
- No automated tests; the app was verified manually plus `npm run build` and `npm run lint`.
