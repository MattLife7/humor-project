"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type VoteButtonsProps = {
  captionId: string;
  userId: string | null;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: number | null;
};

export default function VoteButtons({
  captionId,
  userId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<number | null>(
    initialUserVote
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVote = async (value: 1 | -1) => {
    if (!userId) {
      setMessage("Sign in to cast your verdict.");
      return;
    }

    if (loading || userVote === value) return;

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    try {
      if (userVote === null) {
        const { error } = await supabase
          .from("votes")
          .insert({
            user_id: userId,
            caption_id: captionId,
            value,
          });

        if (error) {
          throw new Error(error.message);
        }

        if (value === 1) {
          setUpvotes((count) => count + 1);
        } else {
          setDownvotes((count) => count + 1);
        }
      } else {
        const { error } = await supabase
          .from("votes")
          .update({ value })
          .eq("user_id", userId)
          .eq("caption_id", captionId);

        if (error) {
          throw new Error(error.message);
        }

        if (userVote === 1 && value === -1) {
          setUpvotes((count) => count - 1);
          setDownvotes((count) => count + 1);
        }

        if (userVote === -1 && value === 1) {
          setDownvotes((count) => count - 1);
          setUpvotes((count) => count + 1);
        }
      }

      setUserVote(value);
    } catch (error) {
      console.error("Vote failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleVote(1)}
          disabled={loading || !userId}
          aria-pressed={userVote === 1}
          className={`group flex items-center gap-2 rounded-full border-2 border-[var(--ink)] px-4 py-2 font-black transition-all duration-150 ${
            userVote === 1
              ? "translate-x-[2px] translate-y-[2px] scale-[1.02] bg-[var(--tomato)] text-white shadow-[1px_1px_0_var(--ink)]"
              : "bg-[var(--paper)] shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:rotate-[-1deg] hover:shadow-[4px_4px_0_var(--ink)]"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span
            className={`transition-transform duration-150 ${
              userVote === 1
                ? "scale-125 rotate-6"
                : "group-hover:scale-110"
            }`}
          >
            🔥
          </span>

          <span>Lit</span>

          <span
            className={`rounded-full px-2 py-0.5 text-sm ${
              userVote === 1
                ? "bg-white/20"
                : "bg-black/10"
            }`}
          >
            {upvotes}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleVote(-1)}
          disabled={loading || !userId}
          aria-pressed={userVote === -1}
          className={`group flex items-center gap-2 rounded-full border-2 border-[var(--ink)] px-4 py-2 font-black transition-all duration-150 ${
            userVote === -1
              ? "translate-x-[2px] translate-y-[2px] scale-[1.02] bg-[var(--coral)] text-white shadow-[1px_1px_0_var(--ink)]"
              : "bg-[var(--paper)] shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:rotate-[1deg] hover:shadow-[4px_4px_0_var(--ink)]"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span
            className={`transition-transform duration-150 ${
              userVote === -1
                ? "scale-125 rotate-[-8deg]"
                : "group-hover:scale-110"
            }`}
          >
            🍅
          </span>

          <span>Tomato, boo</span>

          <span className="text-base">👎</span>

          <span
            className={`rounded-full px-2 py-0.5 text-sm ${
              userVote === -1
                ? "bg-white/20"
                : "bg-black/10"
            }`}
          >
            {downvotes}
          </span>
        </button>
      </div>

      {!userId && (
        <p className="rm-muted mt-3 text-xs font-bold">
          Sign in to judge the bite.
        </p>
      )}

      {message && (
        <p className="mt-3 text-xs font-bold text-[var(--tomato)]">
          {message}
        </p>
      )}
    </div>
  );
}