"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const roastMessages = [
  "🔥 Preheating the roast...",
  "👀 Judging the presentation...",
  "🧂 Looking for something to complain about...",
  "🍅 Consulting the tomato committee...",
  "🧾 Writing up the damage...",
];

type PendingBite = {
  imageUrl: string;
  mimeType: string;
  context: string;
};

export default function CreateBiteForm({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [pendingBite, setPendingBite] =
    useState<PendingBite | null>(null);

  const [canRetry, setCanRetry] = useState(false);
  const [retryAfter, setRetryAfter] =
    useState<number | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMessage("");

    // A new photo means any previous failed request
    // should no longer be retried.
    setPendingBite(null);
    setCanRetry(false);
    setRetryAfter(null);
  };

  const runRoast = async (bite: PendingBite) => {
    let roastInterval: ReturnType<
      typeof setInterval
    > | null = null;

    try {
      let roastMessageIndex = 0;

      setMessage(roastMessages[roastMessageIndex]);

      roastInterval = setInterval(() => {
        roastMessageIndex =
          (roastMessageIndex + 1) %
          roastMessages.length;

        setMessage(
          roastMessages[roastMessageIndex]
        );
      }, 1800);

      const aiResponse = await fetch(
        "/api/generate-caption",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: bite.imageUrl,
            mimeType: bite.mimeType,
            context: bite.context,
          }),
        }
      );

      if (roastInterval) {
        clearInterval(roastInterval);
        roastInterval = null;
      }

      const aiResult = await aiResponse.json();

      if (!aiResponse.ok) {
        if (aiResult.retryable) {
          setCanRetry(true);
          setRetryAfter(
            aiResult.retryAfter ?? null
          );
          setMessage(aiResult.error);
          setSubmitting(false);
          return;
        }

        throw new Error(
          aiResult.error ||
            "Failed to generate caption."
        );
      }

      const caption = aiResult.caption;
      const promptUsed = aiResult.promptUsed;

      if (!caption || !promptUsed) {
        throw new Error(
          "The AI response was missing the caption or prompt."
        );
      }

      setCanRetry(false);
      setRetryAfter(null);

      setMessage(
        "🍽️ Serving it to the feed..."
      );

      const supabase = createClient();

      const {
        data: generation,
        error: generationError,
      } = await supabase
        .from("generations")
        .insert({
          user_id: userId,
          image_url: bite.imageUrl,
          prompt: promptUsed,
        })
        .select("id")
        .single();

      if (generationError) {
        throw new Error(
          generationError.message
        );
      }

      const { error: captionError } =
        await supabase
          .from("captions")
          .insert({
            generation_id: generation.id,
            caption,
          });

      if (captionError) {
        throw new Error(
          captionError.message
        );
      }

      setPendingBite(null);

      setMessage(
        `Fresh roast: “${caption}”`
      );

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1400);
    } catch (error) {
      if (roastInterval) {
        clearInterval(roastInterval);
      }

      console.error(
        "Create bite failed:",
        error
      );

      setCanRetry(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong in the kitchen."
      );

      setSubmitting(false);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!file) {
      setMessage(
        "The kitchen needs a photo first."
      );
      return;
    }

    setSubmitting(true);
    setCanRetry(false);
    setRetryAfter(null);

    setMessage(
      "🍽️ Plating your submission..."
    );

    const supabase = createClient();

    try {
      const extension =
        file.name.split(".").pop() || "jpg";

      const filePath =
        `${userId}/bite-${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("bites")
          .upload(filePath, file);

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("bites")
        .getPublicUrl(filePath);

      const bite: PendingBite = {
        imageUrl: publicUrl,
        mimeType:
          file.type || "image/jpeg",
        context: prompt.trim(),
      };

      // Keep the already-uploaded image around
      // in case Gemini temporarily fails.
      setPendingBite(bite);

      await runRoast(bite);
    } catch (error) {
      console.error(
        "Create bite failed:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong in the kitchen."
      );

      setSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (!pendingBite || submitting) {
      return;
    }

    setSubmitting(true);
    setCanRetry(false);
    setRetryAfter(null);

    // Important: no Storage upload here.
    // We reuse the URL from the first attempt.
    await runRoast(pendingBite);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rm-card overflow-hidden bg-[var(--paper)]"
    >
      <div className="border-b-2 border-[var(--ink)] bg-[var(--tomato)] px-6 py-4 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">
              Kitchen ticket
            </p>

            <h2 className="rm-display mt-1 text-3xl">
              Submit your meal
            </h2>
          </div>

          <div className="rotate-[6deg] rounded-full border-2 border-white bg-[var(--butter)] px-3 py-1 text-sm font-black text-[var(--ink)]">
            HOT
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <label className="font-black">
              1. What are we roasting?
            </label>

            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-ink)]">
              Required
            </span>
          </div>

          <label className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-[var(--ink)] bg-[var(--butter)] text-center transition hover:bg-[var(--yellow)]">
            {preview ? (
              <div className="w-full">
                <img
                  src={preview}
                  alt="Selected meal preview"
                  className="max-h-[520px] w-full object-contain"
                />

                <div className="border-t-2 border-dashed border-[var(--ink)] bg-[var(--paper)] px-4 py-3 text-sm font-black">
                  Click to swap the photo
                </div>
              </div>
            ) : (
              <div className="px-8 py-16">
                <div className="text-6xl transition-transform group-hover:rotate-6 group-hover:scale-110">
                  📸
                </div>

                <p className="rm-display mt-5 text-3xl">
                  Drop the evidence.
                </p>

                <p className="rm-muted mx-auto mt-3 max-w-sm font-medium leading-6">
                  Pick a food photo from your camera roll and let the kitchen
                  staff take it from here.
                </p>

                <div className="rm-button-secondary mt-6">
                  Choose a photo
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={submitting}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <label
              htmlFor="prompt"
              className="font-black"
            >
              2. Give us the backstory
            </label>

            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-ink)]">
              Optional
            </span>
          </div>

          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            placeholder="Overpriced brunch in SoHo. Dining hall food at 1am. My roommate swears this is pasta..."
            rows={5}
            disabled={submitting}
            className="rm-input resize-none disabled:opacity-60"
          />

          <p className="rm-muted mt-3 text-sm font-medium">
            A little context can make the roast more specific. The AI will
            still judge the photo itself.
          </p>
        </div>

        <div className="border-t-2 border-dashed border-[var(--ink)] pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="rm-button-primary w-full text-lg sm:text-xl"
          >
            {submitting ? (
              <>
                <span className="animate-pulse">
                  🔥
                </span>
                Kitchen&apos;s working...
              </>
            ) : (
              <>
                <span>🔥</span>
                Serve it to the AI
              </>
            )}
          </button>

          {message && (
            <div
              className={`mt-5 rounded-2xl border-2 border-[var(--ink)] px-4 py-4 text-center font-bold shadow-[3px_3px_0_var(--ink)] ${
                canRetry
                  ? "bg-[var(--peach)]"
                  : message.startsWith(
                      "Fresh roast:"
                    )
                    ? "bg-[var(--butter)]"
                    : "bg-[var(--peach)]"
              }`}
            >
              <p>{message}</p>

              {canRetry && (
                <div className="mt-4">
                  {retryAfter && (
                    <p className="rm-muted mb-3 text-xs font-semibold">
                      The kitchen suggested
                      waiting about{" "}
                      {retryAfter} seconds.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={submitting}
                    className="rm-button-secondary"
                  >
                    🔥 Try the roast again
                  </button>

                  <p className="rm-muted mt-3 text-xs font-semibold">
                    Your photo is already
                    uploaded — we won&apos;t
                    upload it twice.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}