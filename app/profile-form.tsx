"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({ userId }: { userId: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl shadow-black/50"
      >
        <div className="mb-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-2xl">
            👋
          </div>

          <h2 className="text-2xl font-bold text-white">
            Welcome to The Humor Project
          </h2>

          <p className="mt-2 leading-6 text-gray-400">
            Before you continue, tell us a little about yourself.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="first-name"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              First name
            </label>

            <input
              id="first-name"
              type="text"
              placeholder="Matan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400 focus:bg-white/[0.08]"
            />
          </div>

          <div>
            <label
              htmlFor="last-name"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Last name
            </label>

            <input
              id="last-name"
              type="text"
              placeholder="Ossy"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400 focus:bg-white/[0.08]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Complete profile"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-400">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}