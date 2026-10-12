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
      className="rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-2 text-sm font-black text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] transition-all duration-150 hover:-translate-y-0.5 hover:rotate-[1deg] hover:bg-[var(--peach)] hover:shadow-[4px_4px_0_var(--ink)]"
    >
      Log out
    </button>
  );
}