import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, ImageIcon, LoaderCircle } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlatformIcon } from "@/components/queue/PlatformIcon";
import { PlatformSelector } from "@/features/posts/components/PlatformSelector";
import { SchedulePicker } from "@/features/posts/components/SchedulePicker";
import type { CreatePostInput } from "@/features/posts/postsTypes";
import {
  orderedSelectedPlatforms,
  platformsOverLimit,
  validateComposer,
  type ComposerValues,
} from "@/features/posts/postValidation";
import { selectPostsCreating } from "@/features/posts/postsSelectors";
import { createPost } from "@/features/posts/postsThunks";
import {
  defaultScheduleForDay,
  defaultScheduleLocalValue,
  formatScheduleLabel,
  isHttpUrl,
  localDateTimeToUtcIso,
  localTimeZoneName,
} from "@/features/posts/scheduleTime";
import { parseDateKey } from "@/lib/dates";
import { platformConfig } from "@/lib/platform";
import { cn } from "@/lib/utils";

function ImagePreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);

  if (!isHttpUrl(url)) {
    return null;
  }

  if (failed) {
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <ImageIcon aria-hidden="true" className="size-4" />
        This image could not be loaded.
      </p>
    );
  }

  return (
    <img
      key={url}
      src={url}
      alt="Selected post image"
      className="mt-3 h-36 w-full rounded-2xl object-cover sm:h-44"
      onError={() => setFailed(true)}
    />
  );
}

export function ComposePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const creating = useAppSelector(selectPostsCreating);
  const [values, setValues] = useState<ComposerValues>(() => {
    // `?date=YYYY-MM-DD` comes from "Schedule a post" in the calendar.
    const day = parseDateKey(searchParams.get("date"));

    return {
      content: "",
      platforms: [],
      mediaUrl: "",
      pdfFile: "",
      scheduledAt: day
        ? defaultScheduleForDay(day)
        : defaultScheduleLocalValue(),
    };
  });
  const [attempted, setAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const errors = attempted ? validateComposer(values) : {};
  const selectedPlatforms = orderedSelectedPlatforms(values.platforms);
  const overLimit = platformsOverLimit(values.content, values.platforms);
  const timeZone = localTimeZoneName();

  function update<Key extends keyof ComposerValues>(
    key: Key,
    value: ComposerValues[Key]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitError(null);
  }

  function cancel() {
    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    navigate("/queue");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (creating) {
      return;
    }

    setAttempted(true);
    setSubmitError(null);
    const nextErrors = validateComposer(values);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const scheduledAt = localDateTimeToUtcIso(values.scheduledAt);
    if (!scheduledAt) {
      return;
    }

    const input: CreatePostInput = {
      content: values.content,
      platforms: values.platforms,
      scheduledAt,
    };
    const mediaUrl = values.mediaUrl.trim();
    if (mediaUrl) {
      input.mediaUrl = mediaUrl;
    }

    const result = await dispatch(createPost(input));

    if (createPost.fulfilled.match(result)) {
      if (searchParams.has("date")) {
        // Opened from the calendar: return to the day the post now lives on.
        const day = values.scheduledAt.slice(0, 10);
        navigate({ pathname: "/calendar", search: `?date=${day}` });
        return;
      }

      navigate("/queue", { state: { postScheduled: true } });
      return;
    }

    setSubmitError(
      typeof result.payload === "string"
        ? result.payload
        : "Unable to create the post. Please retry."
    );
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type === "application/pdf") {
      // Create a temporary local URL for the PDF file
      const fileUrl = URL.createObjectURL(file);
      setValues({ ...values, pdfFile: fileUrl });
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const previewImage = isHttpUrl(values.mediaUrl.trim());

  useEffect(() => {
    console.log({ values });
    // setPreviewUrl(URL.createObjectURL());
  }, [values.pdfFile]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1080px]">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="mt-1 rounded-full"
          aria-label="Back to queue"
          onClick={cancel}
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div>
          <h1 className="text-[32px] leading-none font-bold tracking-tight">
            Create a post
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bring your next idea to life across your social channels.
          </p>
        </div>
      </div>

      <form
        className="mt-6 grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="soft-card min-w-0 space-y-6 p-4 sm:p-6">
          <div>
            <label htmlFor="post-content" className="text-sm font-semibold">
              Post
            </label>
            <textarea
              id="post-content"
              value={values.content}
              placeholder="What would you like to share?"
              aria-invalid={Boolean(errors.content)}
              aria-describedby={
                errors.content
                  ? "post-content-error character-counts"
                  : "character-counts"
              }
              onChange={(event) => update("content", event.target.value)}
              className="mt-2 min-h-40 w-full resize-y rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            <div id="character-counts" className="mt-2" aria-live="polite">
              {selectedPlatforms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Select a platform to see its character limit.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {selectedPlatforms.map((platform) => {
                    const limit = platformConfig[platform].characterLimit;
                    const count = values.content.length;
                    const exceeded = count > limit;

                    return (
                      <li key={platform}>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                            exceeded
                              ? "border-destructive/30 bg-danger-soft font-semibold text-destructive"
                              : "border-border bg-muted text-muted-foreground"
                          )}
                        >
                          {platformConfig[platform].label}
                          <span>
                            {count.toLocaleString()} / {limit.toLocaleString()}
                          </span>
                          {exceeded ? <span>Over limit</span> : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {errors.content ? (
              <p
                id="post-content-error"
                className="mt-2 text-sm text-destructive"
              >
                {errors.content}
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold">Platforms</p>
            <div className="mt-2">
              <PlatformSelector
                value={values.platforms}
                disabled={creating}
                invalid={Boolean(errors.platforms)}
                describedBy={
                  errors.platforms ? "post-platforms-error" : undefined
                }
                onChange={(platforms) => update("platforms", platforms)}
              />
            </div>
            {errors.platforms ? (
              <p
                id="post-platforms-error"
                className="mt-2 text-sm text-destructive"
              >
                {errors.platforms}
              </p>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="post-image" className="text-sm font-semibold">
                Image URL (optional)
              </label>
              {values.mediaUrl ? (
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => update("mediaUrl", "")}
                >
                  Clear image
                </button>
              ) : null}
            </div>
            <Input
              id="post-image"
              type="url"
              inputMode="url"
              value={values.mediaUrl}
              placeholder="https://example.com/image.jpg"
              aria-invalid={Boolean(errors.mediaUrl)}
              aria-describedby={
                errors.mediaUrl ? "post-image-error" : undefined
              }
              onChange={(event) => update("mediaUrl", event.target.value)}
              className="mt-2 h-11 rounded-2xl border-border bg-card px-4"
            />
            {errors.mediaUrl ? (
              <p
                id="post-image-error"
                className="mt-2 text-sm text-destructive"
              >
                {errors.mediaUrl}
              </p>
            ) : (
              <ImagePreview
                key={values.mediaUrl.trim()}
                url={values.mediaUrl.trim()}
              />
            )}
          </div>
          {/* PDF uploader */}
          <div className=" h-20 ">
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label htmlFor="post-schedule" className="text-sm font-semibold">
              Schedule date and time
            </label>
            <div className="mt-2">
              <SchedulePicker
                id="post-schedule"
                value={values.scheduledAt}
                disabled={creating}
                invalid={Boolean(errors.scheduledAt)}
                describedBy={
                  errors.scheduledAt
                    ? "schedule-timezone post-schedule-error"
                    : "schedule-timezone"
                }
                onChange={(scheduledAt) => update("scheduledAt", scheduledAt)}
              />
            </div>
            <p
              id="schedule-timezone"
              className="mt-2 text-xs text-muted-foreground"
            >
              {timeZone
                ? `Times shown in your local timezone (${timeZone}).`
                : "Times are shown in your local timezone."}
            </p>
            {errors.scheduledAt ? (
              <p
                id="post-schedule-error"
                className="mt-2 text-sm text-destructive"
              >
                {errors.scheduledAt}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={cancel}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || overLimit.length > 0}
              aria-describedby={
                overLimit.length > 0 ? "character-counts" : undefined
              }
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {creating ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : null}
              {creating ? "Scheduling…" : "Schedule Post"}
            </Button>
          </div>
        </div>

        <aside className="soft-card min-w-0 p-4 sm:p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Preview
          </p>
          <p className="mt-3 text-sm leading-6 break-words whitespace-pre-line text-foreground [overflow-wrap:anywhere]">
            {values.content.trim()
              ? values.content
              : "Your post will appear here."}
          </p>
          {previewImage ? (
            <p className="mt-3 text-xs text-muted-foreground">
              An image URL is attached.
            </p>
          ) : null}
          {values.pdfFile && (
            <div>
              <p>Preview of PDF</p>
              <iframe src={values.pdfFile} width="50%" height="50%" />
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {values.platforms.length > 0 ? (
              values.platforms.map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs font-medium"
                >
                  <PlatformIcon
                    platform={platform}
                    decorative
                    className="size-6"
                  />
                  {platformConfig[platform].label}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No platforms selected.
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {formatScheduleLabel(values.scheduledAt)}
          </p>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            This is a preview of the post you are composing.
          </p>
        </aside>
      </form>
    </div>
  );
}
