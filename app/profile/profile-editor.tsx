"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
};

export default function ProfileEditor({
  userId,
  email,
  firstName,
  lastName,
  avatarUrl,
}: Props) {
  const router = useRouter();

  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [avatar, setAvatar] = useState(avatarUrl);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: first,
        last_name: last,
      })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Your booth card is updated.");

    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage("");

    const supabase = createClient();

    const fileExtension = file.name.split(".").pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      setMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);

    if (profileError) {
      setMessage(profileError.message);
      setUploading(false);
      return;
    }

    setAvatar(publicUrl);
    setUploading(false);
    setMessage("Fresh photo. Looking sharp.");
  };

  return (
    <form
      onSubmit={handleSave}
      className="rm-card overflow-hidden bg-[var(--paper)]"
    >
      <div className="border-b-2 border-[var(--ink)] bg-[var(--coral)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--ink)]/70">
              Regular&apos;s card
            </p>

            <h2 className="rm-display mt-1 text-3xl">
              Your profile
            </h2>
          </div>

          <div className="rotate-[5deg] rounded-full border-2 border-[var(--ink)] bg-[var(--butter)] px-3 py-1 text-sm font-black shadow-[2px_2px_0_var(--ink)]">
            VIP-ish
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <section>
          <p className="mb-4 font-black">
            Profile photo
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-32 w-32 shrink-0 rotate-[-2deg] overflow-hidden rounded-3xl border-2 border-[var(--ink)] bg-[var(--butter)] shadow-[4px_4px_0_var(--ink)]">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl">
                  👤
                </div>
              )}
            </div>

            <div>
              <label className="rm-button-secondary cursor-pointer">
                {uploading ? "Changing photo..." : "Change photo"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <p className="rm-muted mt-3 max-w-xs text-sm font-medium leading-6">
                Pick something recognizable. Or at least something less
                embarrassing than your dinner.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t-2 border-dashed border-[var(--ink)]" />

        <section className="space-y-6">
          <div>
            <label className="mb-2 block font-black">
              Email
            </label>

            <input
              value={email}
              disabled
              className="rm-input cursor-not-allowed bg-[var(--butter)] opacity-70"
            />

            <p className="rm-muted mt-2 text-xs font-semibold">
              This comes from your login account and can&apos;t be edited here.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first-name"
                className="mb-2 block font-black"
              >
                First name
              </label>

              <input
                id="first-name"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                className="rm-input"
                placeholder="First name"
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
                value={last}
                onChange={(e) => setLast(e.target.value)}
                className="rm-input"
                placeholder="Last name"
              />
            </div>
          </div>
        </section>

        <div className="border-t-2 border-dashed border-[var(--ink)] pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rm-button-primary w-full text-lg"
          >
            {saving ? (
              <>
                <span className="animate-pulse">✍️</span>
                Updating your card...
              </>
            ) : (
              <>
                <span>✓</span>
                Save profile
              </>
            )}
          </button>

          {message && (
            <div className="mt-5 rounded-2xl border-2 border-[var(--ink)] bg-[var(--butter)] px-4 py-3 text-center font-bold shadow-[3px_3px_0_var(--ink)]">
              {message}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}