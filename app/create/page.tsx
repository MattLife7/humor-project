import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateBiteForm from "./create-bite-form";
import Link from "next/link";

export default async function CreatePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

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
                Back to the counter
              </p>
            </div>
          </Link>

          <Link href="/" className="rm-button-secondary">
            ← Feed
          </Link>
        </header>

        <section className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rm-chip rotate-[-2deg]">
              Order ticket #001
            </div>

            <h1 className="rm-display mt-6 text-6xl leading-[0.9] sm:text-7xl">
              Order up.
            </h1>

            <p className="rm-display mt-2 text-4xl leading-none text-[var(--tomato)] sm:text-5xl">
              Let&apos;s ruin dinner.
            </p>

            <p className="rm-muted mt-7 max-w-md text-lg font-medium leading-8">
              Drop in a photo of your meal. Give us a little context if
              there&apos;s a story behind it. Then let the AI take the first bite.
            </p>

            <div className="rm-card-soft mt-8 max-w-md p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tomato)]">
                House rules
              </p>

              <ul className="mt-4 space-y-3 font-semibold">
                <li className="flex gap-3">
                  <span>🍽️</span>
                  <span>Real food photos work best.</span>
                </li>

                <li className="flex gap-3">
                  <span>🔥</span>
                  <span>The roast should match what&apos;s actually visible.</span>
                </li>

                <li className="flex gap-3">
                  <span>🍅</span>
                  <span>The internet gets the final say.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 rotate-[2deg] rounded-2xl border-2 border-[var(--ink)] bg-[var(--peach)] p-5 shadow-[4px_4px_0_var(--ink)]">
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Chef&apos;s note
              </p>

              <p className="rm-display mt-2 text-2xl leading-tight">
                Bad presentation is not a bug.
                <span className="text-[var(--tomato)]">
                  {" "}
                  It&apos;s material.
                </span>
              </p>
            </div>
          </div>

          <CreateBiteForm userId={user.id} />
        </section>
      </div>
    </main>
  );
}