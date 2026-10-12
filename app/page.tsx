import LoginButton from "./login-button";
import ProfileForm from "./profile-form";
import VoteButtons from "./vote-buttons";
import LogoutButton from "./logout-button";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Vote = {
  user_id: string;
  value: number;
};

type Caption = {
  id: string;
  caption: string;
  votes: Vote[];
};

type Author = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

function formatTimeAgo(dateString: string) {
  const created = new Date(dateString);
  const now = new Date();

  const diffSeconds = Math.max(
    0,
    Math.floor((now.getTime() - created.getTime()) / 1000)
  );

  if (diffSeconds < 60) {
    return "just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return created.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  const { data: generations, error } = await supabase
    .from("generations")
    .select(`
      id,
      user_id,
      image_url,
      created_at,
      profiles (
        first_name,
        last_name,
        avatar_url
      ),
      captions!inner (
        id,
        caption,
        votes (
          user_id,
          value
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rm-card max-w-md p-8 text-center">
          <div className="text-5xl">🍕</div>

          <h1 className="rm-display mt-4 text-3xl">
            Kitchen disaster.
          </h1>

          <p className="rm-muted mt-3">
            Something went wrong loading the feed.
          </p>

          <p className="mt-4 text-sm text-red-700">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <div
        className="h-4 border-b-2 border-[var(--ink)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--tomato) 0 28px, var(--paper) 28px 56px)",
        }}
      />

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-14 w-14 rotate-[-5deg] items-center justify-center rounded-2xl border-2 border-[var(--ink)] bg-[var(--butter)] text-3xl shadow-[4px_4px_0_var(--ink)] transition group-hover:rotate-[2deg]">
              🍕
            </div>

            <div>
              <p className="rm-brand text-2xl leading-none sm:text-3xl">
                Rate My Bite
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                Served with zero mercy
              </p>
            </div>
          </Link>

          {!user ? (
            <LoginButton />
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/create"
                className="rm-button-primary"
              >
                <span>🍽️</span>
                Roast my bite
              </Link>

              <Link
                href="/profile"
                className="rm-button-secondary"
              >
                {profile?.first_name
                  ? `Hey, ${profile.first_name}`
                  : "My profile"}
              </Link>

              <LogoutButton />
            </div>
          )}
        </header>

        {/* HERO */}
        <section className="relative mt-14 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="rm-chip rotate-[-1deg]">
              Fresh out of the AI oven
            </div>

            <h1 className="rm-display mt-6 max-w-4xl text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
              Your dinner
              <span className="text-[var(--tomato)]">
                {" "}
                asked for it.
              </span>
            </h1>

            <p className="rm-muted mt-7 max-w-2xl text-lg font-medium leading-8 sm:text-xl">
              Upload whatever you&apos;re eating. Our AI takes one look,
              roasts it, and hands the verdict over to the internet.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  href="/create"
                  className="rm-button-primary text-lg"
                >
                  Submit your meal
                  <span>→</span>
                </Link>
              ) : (
                <LoginButton />
              )}

              <span className="max-w-xs text-sm font-semibold text-[var(--muted-ink)]">
                No food critics. No Michelin stars. Just consequences.
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="rm-card rotate-[3deg] bg-[var(--peach)] p-7">
              <div className="flex items-center justify-between border-b-2 border-dashed border-[var(--ink)] pb-4">
                <span className="rm-display text-3xl">
                  Today&apos;s Special
                </span>

                <span className="text-4xl">🍕</span>
              </div>

              <div className="py-8 text-center">
                <p className="text-sm font-black uppercase tracking-[0.2em]">
                  Chef&apos;s recommendation
                </p>

                <p className="rm-display mt-3 text-5xl leading-none text-[var(--tomato)]">
                  Humiliation
                </p>

                <p className="mt-5 font-semibold leading-7">
                  Served fresh with one brutally specific AI roast and a
                  side of public judgment.
                </p>
              </div>

              <div className="border-t-2 border-dashed border-[var(--ink)] pt-4 text-center text-sm font-black uppercase tracking-[0.15em]">
                ★ Always in season ★
              </div>
            </div>
          </div>
        </section>

        {/* SEPARATOR */}
        <div className="my-16 flex items-center gap-4">
          <div className="h-[2px] flex-1 bg-[var(--ink)]" />
          <span className="text-2xl">🍅</span>
          <div className="h-[2px] flex-1 bg-[var(--ink)]" />
          <span className="text-2xl">🧀</span>
          <div className="h-[2px] flex-1 bg-[var(--ink)]" />
        </div>

        {/* FEED */}
        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="rm-chip rm-chip-red">
                Fresh victims
              </div>

              <h2 className="rm-display mt-3 text-4xl sm:text-5xl">
                Straight from the kitchen
              </h2>

              <p className="rm-muted mt-2 font-medium">
                Newest meals get roasted first.
              </p>
            </div>

            <div className="rounded-full border-2 border-[var(--ink)] bg-[var(--butter)] px-4 py-2 font-black shadow-[3px_3px_0_var(--ink)]">
              {generations?.length ?? 0}{" "}
              {generations?.length === 1 ? "bite" : "bites"}
            </div>
          </div>

          {generations && generations.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {generations.map((generation, index) => {
                const captionRaw =
                  generation.captions as unknown as
                    | Caption
                    | Caption[];

                const authorRaw =
                  generation.profiles as unknown as
                    | Author
                    | Author[];

                const caption = Array.isArray(captionRaw)
                  ? captionRaw[0]
                  : captionRaw;

                const author = Array.isArray(authorRaw)
                  ? authorRaw[0]
                  : authorRaw;

                const votes = caption?.votes ?? [];

                const upvotes = votes.filter(
                  (vote) => vote.value === 1
                ).length;

                const downvotes = votes.filter(
                  (vote) => vote.value === -1
                ).length;

                const currentUserVote = user
                  ? votes.find(
                      (vote) => vote.user_id === user.id
                    )?.value ?? null
                  : null;

                const authorName =
                  [author?.first_name, author?.last_name]
                    .filter(Boolean)
                    .join(" ") || "Mystery diner";

                return (
                  <article
                    key={generation.id}
                    className={`rm-card overflow-hidden ${
                      index % 2 === 0
                        ? "rotate-[-0.5deg]"
                        : "rotate-[0.5deg]"
                    } transition-transform duration-200 hover:rotate-0 hover:-translate-y-1`}
                  >
                    {/* AUTHOR BAR */}
                    <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--ink)] bg-[var(--paper)] px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[var(--ink)] bg-[var(--butter)]">
                          {author?.avatar_url ? (
                            <img
                              src={author.avatar_url}
                              alt={authorName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl">
                              👤
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-black">
                            {authorName}
                          </p>

                          <p className="rm-muted text-xs font-semibold">
                            submitted a bite
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-xs font-bold text-[var(--muted-ink)]">
                        {formatTimeAgo(generation.created_at)}
                      </span>
                    </div>

                    {/* FOOD IMAGE */}
                    <div className="relative border-b-2 border-[var(--ink)] bg-[var(--butter)]">
                      <img
                        src={generation.image_url}
                        alt="Food submitted for roasting"
                        className="max-h-[620px] w-full object-contain"
                      />

                      <div className="absolute left-4 top-4 rotate-[-3deg] rounded-full border-2 border-[var(--ink)] bg-[var(--tomato)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[3px_3px_0_var(--ink)]">
                        Bite #{generations.length - index}
                      </div>
                    </div>

                    {/* ROAST */}
                    <div className="p-6 sm:p-7">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔥</span>

                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tomato)]">
                          The roast
                        </p>
                      </div>

                      <blockquote className="rm-display mt-3 text-2xl leading-tight sm:text-3xl">
                        “{caption?.caption}”
                      </blockquote>

                      <div className="mt-6 border-t-2 border-dashed border-[var(--ink)] pt-5">
                        {caption && (
                          <VoteButtons
                            captionId={caption.id}
                            userId={user?.id ?? null}
                            initialUpvotes={upvotes}
                            initialDownvotes={downvotes}
                            initialUserVote={currentUserVote}
                          />
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rm-card bg-[var(--butter)] px-6 py-16 text-center">
              <div className="text-6xl">🍽️</div>

              <h3 className="rm-display mt-5 text-4xl">
                The kitchen is suspiciously quiet.
              </h3>

              <p className="rm-muted mx-auto mt-3 max-w-md font-medium">
                Nobody has offered up a meal for public humiliation yet.
              </p>

              {user && (
                <Link
                  href="/create"
                  className="rm-button-primary mt-7"
                >
                  Be the first victim
                </Link>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-20 border-t-2 border-[var(--ink)] py-8 text-center">
          <p className="rm-brand text-xl">
            🍕 Rate My Bite
          </p>

          <p className="rm-muted mt-2 text-sm font-semibold">
            Bad meals. Good roasts.
          </p>
        </footer>
      </div>

      {user &&
        (!profile?.first_name ||
          !profile?.last_name) && (
          <ProfileForm userId={user.id} />
        )}
    </main>
  );
}