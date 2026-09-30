"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.38Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.96-.9 6.61-2.39l-3.22-2.51c-.89.6-2.03.95-3.39.95-2.6 0-4.81-1.76-5.6-4.12H3.08v2.59A10 10 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.4 13.93a6 6 0 0 1 0-3.86V7.48H3.08a10 10 0 0 0 0 9.04l3.32-2.59Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.95c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.92 5.48l3.32 2.59c.79-2.36 3-4.12 5.6-4.12Z"
        />
      </svg>

      {loading ? "Connecting..." : "Continue with Google"}
    </button>
  );
}