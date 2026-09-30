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

    setMessage("Profile updated successfully.");

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
    setMessage("Profile photo updated.");
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-8"
    >
      <div className="mb-8">
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl text-gray-500">
                👤
              </span>
            )}
          </div>

          <div>
            <label className="inline-flex cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
              {uploading ? "Uploading..." : "Upload photo"}

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG, WebP, or another image format
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Email
          </label>

          <input
            value={email}
            disabled
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            First name
          </label>

          <input
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Last name
          </label>

          <input
            value={last}
            onChange={(e) => setLast(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        {message && (
          <p className="text-sm text-gray-400">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}