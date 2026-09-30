"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
    >
      Log out
    </button>
  );
}