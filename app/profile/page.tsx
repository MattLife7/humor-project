import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileEditor from "./profile-editor";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen">
      <div
        className="h-4 border-b-2 border-[var(--ink)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--tomato) 0 28px, var(--paper) 28px 56px)",
        }}
      />

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 rotate-[-5deg] items-center justify-center rounded-2xl border-2 border-[var(--ink)] bg-[var(--butter)] text-2xl shadow-[4px_4px_0_var(--ink)] transition group-hover:rotate-[2deg]">
              🍕
            </div>

            <div>
              <p className="rm-brand text-2xl leading-none">
                Rate My Bite
              </p>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--coral)]">
                Your regular&apos;s card
              </p>
            </div>
          </Link>

          <Link href="/" className="rm-button-secondary">
            ← Feed
          </Link>
        </header>

        <section className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rm-chip rotate-[-2deg]">
              House regular
            </div>

            <h1 className="rm-display mt-6 text-6xl leading-[0.9] sm:text-7xl">
              Your corner
              <span className="text-[var(--tomato)]"> booth.</span>
            </h1>

            <p className="rm-muted mt-7 max-w-md text-lg font-medium leading-8">
              Keep your name and photo fresh so everyone knows who&apos;s
              responsible for the meals entering the kitchen.
            </p>

            <div className="rm-card-soft mt-8 max-w-md p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tomato)]">
                On the house
              </p>

              <div className="mt-4 space-y-3 font-semibold">
                <p className="flex gap-3">
                  <span>📸</span>
                  <span>Swap your profile photo anytime.</span>
                </p>

                <p className="flex gap-3">
                  <span>✍️</span>
                  <span>Keep your name up to date.</span>
                </p>

                <p className="flex gap-3">
                  <span>🍕</span>
                  <span>Your account stays tied to your bites and votes.</span>
                </p>
              </div>
            </div>

            <div className="mt-8 rotate-[2deg] rounded-2xl border-2 border-[var(--ink)] bg-[var(--peach)] p-5 shadow-[4px_4px_0_var(--ink)]">
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Diner wisdom
              </p>

              <p className="rm-display mt-2 text-2xl leading-tight">
                A good profile photo won&apos;t save a bad dinner.
              </p>
            </div>
          </div>

          <ProfileEditor
            userId={user.id}
            email={user.email ?? ""}
            firstName={profile?.first_name ?? ""}
            lastName={profile?.last_name ?? ""}
            avatarUrl={profile?.avatar_url ?? ""}
          />
        </section>
      </div>
    </main>
  );
}