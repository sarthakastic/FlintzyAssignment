import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  formatScheduleLabel,
  parseLocalDateTime,
  roundUpToMinuteStep,
  scheduleMinuteStep,
  toLocalDateTimeValue,
} from "@/features/posts/scheduleTime";
import {
  addDays,
  isSameDay,
  monthGrid,
  startOfDay,
  startOfMonth,
  weekdayNames,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

type SchedulePickerProps = {
  id: string;
  /** Local wall-clock value in `YYYY-MM-DDTHH:MM` form, as stored by the composer. */
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
};

function atTime(day: Date, hours: number, minutes: number) {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours,
    minutes
  );
}

function uses12HourClock() {
  try {
    return (
      new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions()
        .hour12 ?? true
    );
  } catch {
    return true;
  }
}

function quickPicks(now: Date) {
  const tomorrow = addDays(startOfDay(now), 1);
  const daysToMonday = (8 - now.getDay()) % 7 || 7;

  return [
    {
      label: "In 1 hour",
      date: roundUpToMinuteStep(new Date(now.getTime() + 60 * 60 * 1000)),
    },
    { label: "Tomorrow morning", date: atTime(tomorrow, 9, 0) },
    { label: "Tomorrow evening", date: atTime(tomorrow, 18, 0) },
    {
      label: "Next Monday",
      date: atTime(addDays(startOfDay(now), daysToMonday), 9, 0),
    },
  ];
}

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});
const shortDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const fullDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const monthFormat = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});
const twelveHour = uses12HourClock();

const selectClassName =
  "h-10 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card pr-8 pl-3 text-sm font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Date and time picker for scheduling. It only ever emits future local
 * wall-clock values; UTC conversion happens once, on submit, in the composer.
 */
export function SchedulePicker({
  id,
  value,
  onChange,
  invalid = false,
  describedBy,
  disabled = false,
}: SchedulePickerProps) {
  const dialogId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const focusDayOnRender = useRef(false);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const selected = parseLocalDateTime(value);
  const current =
    selected ?? roundUpToMinuteStep(new Date(now.getTime() + 60 * 60 * 1000));
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(current));
  const [focusDay, setFocusDay] = useState(() => startOfDay(current));
  const today = startOfDay(now);

  // Lock page scroll while the modal is open.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !focusDayOnRender.current) {
      return;
    }

    focusDayOnRender.current = false;
    gridRef.current
      ?.querySelector<HTMLButtonElement>('button[tabindex="0"]')
      ?.focus({ preventScroll: true });
  }, [open, focusDay, viewMonth]);

  function openPicker() {
    const fresh = new Date();
    setNow(fresh);
    setViewMonth(startOfMonth(current));
    setFocusDay(startOfDay(current < fresh ? fresh : current));
    focusDayOnRender.current = true;
    setOpen(true);
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    // Keep keyboard focus inside the modal.
    const focusable = [
      ...(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([tabindex="-1"]), select:not([disabled])'
      ) ?? []),
    ];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Never emit a past time: anything earlier than now snaps to the next free slot.
  function emit(date: Date) {
    const fresh = new Date();
    onChange(
      toLocalDateTimeValue(date > fresh ? date : roundUpToMinuteStep(fresh))
    );
  }

  function selectDay(day: Date) {
    setFocusDay(day);
    emit(atTime(day, current.getHours(), current.getMinutes()));
  }

  function setTime(hours: number, minutes: number) {
    emit(atTime(current, hours, minutes));
  }

  function moveFocus(next: Date) {
    const clamped = next < today ? today : next;
    focusDayOnRender.current = true;
    setFocusDay(clamped);
    setViewMonth(startOfMonth(clamped));
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in offsets) {
      event.preventDefault();
      moveFocus(addDays(focusDay, offsets[event.key]));
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const delta = event.key === "PageUp" ? -1 : 1;
      moveFocus(
        new Date(
          focusDay.getFullYear(),
          focusDay.getMonth() + delta,
          focusDay.getDate()
        )
      );
    }
  }

  // Days outside the visible month render as empty cells.
  const cells = monthGrid(viewMonth).map((day) =>
    day.getMonth() === viewMonth.getMonth() ? day : null
  );
  const focusVisible =
    focusDay.getMonth() === viewMonth.getMonth() &&
    focusDay.getFullYear() === viewMonth.getFullYear();
  const firstSelectable = cells.find(
    (day): day is Date => day !== null && day >= today
  );
  const tabStop = focusVisible ? focusDay : firstSelectable;
  const canGoBack = startOfMonth(viewMonth) > startOfMonth(today);

  const hours24 = current.getHours();
  const minutes = current.getMinutes();
  const isPm = hours24 >= 12;
  const isPast = (hours: number, mins: number) =>
    atTime(current, hours, mins) <= now;
  const minuteOptions = Array.from(
    { length: 60 / scheduleMinuteStep },
    (_, index) => index * scheduleMinuteStep
  );
  if (!minuteOptions.includes(minutes)) {
    minuteOptions.push(minutes);
    minuteOptions.sort((left, right) => left - right);
  }
  const hourOptions = twelveHour
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => ({
        label: String(hour),
        value: (hour % 12) + (isPm ? 12 : 0),
      }))
    : Array.from({ length: 24 }, (_, hour) => ({
        label: String(hour).padStart(2, "0"),
        value: hour,
      }));

  return (
    <div>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-2xl border bg-card px-4 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-60",
          invalid ? "border-destructive" : "border-border"
        )}
      >
        <CalendarClock
          aria-hidden="true"
          className="size-4 shrink-0 text-primary"
        />
        <span
          className={cn(
            "flex-1 truncate",
            !selected && "text-muted-foreground"
          )}
        >
          {formatScheduleLabel(value)}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  close();
                }
              }}
            >
              <div
                ref={dialogRef}
                id={dialogId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${dialogId}-title`}
                className="max-h-[calc(100svh-2rem)] w-full max-w-[22rem] overflow-y-auto rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)]"
                onKeyDown={onDialogKeyDown}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p id={`${dialogId}-title`} className="text-sm font-semibold">
                    Choose date and time
                  </p>
                  <button
                    type="button"
                    aria-label="Close date and time picker"
                    onClick={close}
                    className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {quickPicks(now).map((pick) => {
                    const active =
                      selected !== null &&
                      pick.date.getTime() === selected.getTime();

                    return (
                      <button
                        key={pick.label}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setFocusDay(startOfDay(pick.date));
                          setViewMonth(startOfMonth(pick.date));
                          emit(pick.date);
                        }}
                        className={cn(
                          "rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-primary bg-accent"
                            : "border-border hover:bg-muted"
                        )}
                      >
                        <span className="block text-xs font-semibold">
                          {pick.label}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {shortDateFormat.format(pick.date)} ·{" "}
                          {timeFormat.format(pick.date)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-semibold" aria-live="polite">
                    {monthFormat.format(viewMonth)}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Previous month"
                      disabled={!canGoBack}
                      onClick={() =>
                        setViewMonth(
                          new Date(
                            viewMonth.getFullYear(),
                            viewMonth.getMonth() - 1,
                            1
                          )
                        )
                      }
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                    >
                      <ChevronLeft aria-hidden="true" className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next month"
                      onClick={() =>
                        setViewMonth(
                          new Date(
                            viewMonth.getFullYear(),
                            viewMonth.getMonth() + 1,
                            1
                          )
                        )
                      }
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </div>

                <div
                  className="mt-2 grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground"
                  aria-hidden="true"
                >
                  {weekdayNames.map((name) => (
                    <span key={name}>{name.slice(0, 2)}</span>
                  ))}
                </div>
                <div
                  ref={gridRef}
                  role="group"
                  aria-label={`Days in ${monthFormat.format(viewMonth)}`}
                  className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm"
                  onKeyDown={onGridKeyDown}
                >
                  {cells.map((day, index) => {
                    if (!day) {
                      return <span key={`empty-${index}`} />;
                    }

                    const past = day < today;
                    const isSelected =
                      selected !== null && isSameDay(day, selected);
                    const isToday = isSameDay(day, today);

                    return (
                      <button
                        key={day.getDate()}
                        type="button"
                        disabled={past}
                        tabIndex={tabStop && isSameDay(day, tabStop) ? 0 : -1}
                        aria-pressed={isSelected}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={fullDateFormat.format(day)}
                        onClick={() => selectDay(day)}
                        className={cn(
                          "mx-auto inline-flex size-9 items-center justify-center rounded-full tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground/40",
                          isSelected
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "hover:bg-muted",
                          !isSelected && isToday && "font-semibold text-primary"
                        )}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>

                <fieldset className="mt-4 border-t border-border pt-4">
                  <legend className="sr-only">Time</legend>
                  <div className="flex items-end gap-2">
                    <label className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Hour
                      </span>
                      <span className="relative block">
                        <select
                          className={selectClassName}
                          value={hours24}
                          onChange={(event) =>
                            setTime(Number(event.target.value), minutes)
                          }
                        >
                          {hourOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={isPast(option.value, 59)}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          aria-hidden="true"
                          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                        />
                      </span>
                    </label>
                    <label className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Minute
                      </span>
                      <span className="relative block">
                        <select
                          className={selectClassName}
                          value={minutes}
                          onChange={(event) =>
                            setTime(hours24, Number(event.target.value))
                          }
                        >
                          {minuteOptions.map((minute) => (
                            <option
                              key={minute}
                              value={minute}
                              disabled={isPast(hours24, minute)}
                            >
                              {String(minute).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          aria-hidden="true"
                          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                        />
                      </span>
                    </label>
                    {twelveHour ? (
                      <div
                        role="group"
                        aria-label="AM or PM"
                        className="flex h-10 shrink-0 rounded-xl border border-border p-0.5"
                      >
                        {(["AM", "PM"] as const).map((period) => {
                          const pm = period === "PM";
                          const target = (hours24 % 12) + (pm ? 12 : 0);

                          return (
                            <button
                              key={period}
                              type="button"
                              aria-pressed={pm === isPm}
                              disabled={isPast(pm ? 23 : 11, 59)}
                              onClick={() => setTime(target, minutes)}
                              className={cn(
                                "rounded-[10px] px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
                                pm === isPm
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {period}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </fieldset>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p
                    className="min-w-0 text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    {selected
                      ? `${shortDateFormat.format(
                          selected
                        )} at ${timeFormat.format(selected)} hrs`
                      : "No time selected"}
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="h-9 shrink-0 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
