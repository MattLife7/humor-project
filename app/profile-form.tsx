"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({
  userId,
}: {
  userId: string;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq("id", userId);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(36,26,22,0.55)] px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="rm-card relative w-full max-w-lg overflow-hidden bg-[var(--paper)]"
      >
        <div className="border-b-2 border-[var(--ink)] bg-[var(--tomato)] px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">
                First visit
              </p>

              <h2 className="rm-display mt-1 text-3xl">
                Welcome to Rate My Bite
              </h2>
            </div>

            <div className="rotate-[6deg] rounded-full border-2 border-white bg-[var(--butter)] px-3 py-1 text-sm font-black text-[var(--ink)]">
              NEW
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-7">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 rotate-[-5deg] items-center justify-center rounded-2xl border-2 border-[var(--ink)] bg-[var(--butter)] text-3xl shadow-[3px_3px_0_var(--ink)]">
                🍕
              </div>

              <div>
                <h3 className="rm-display text-2xl">
                  Grab a name tag.
                </h3>

                <p className="rm-muted mt-2 leading-6">
                  Before you join the kitchen, tell us what name
                  should appear next to your bites.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-[var(--ink)] pt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first-name"
                  className="mb-2 block font-black"
                >
                  First name
                </label>

                <input
                  id="first-name"
                  type="text"
                  placeholder="Matan"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                  required
                  className="rm-input"
                />
              </div>

              <div>
                <label
                  htmlFor="last-name"
                  className="mb-2 block font-black"
                >
                  Last name
                </label>

                <input
                  id="last-name"
                  type="text"
                  placeholder="Ossy"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  required
                  className="rm-input"
                />
              </div>
            </div>

            <p className="rm-muted mt-3 text-sm font-medium">
              This is public profile info and can appear next to
              the bites you post.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rm-button-primary mt-7 w-full text-lg"
          >
            {saving ? (
              <>
                <span className="animate-pulse">
                  🍽️
                </span>
                Setting your table...
              </>
            ) : (
              <>
                <span>🍕</span>
                Take me to the feed
              </>
            )}
          </button>

          {message && (
            <div className="mt-5 rounded-2xl border-2 border-[var(--ink)] bg-[var(--peach)] px-4 py-3 text-center font-bold shadow-[3px_3px_0_var(--ink)]">
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}