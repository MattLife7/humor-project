import LoginButton from "./login-button";
import ProfileForm from "./profile-form";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "./logout-button";

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

  const { data: memes, error } = await supabase
    .from("memes")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b12] text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-red-300">{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090b12] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        <header className="mb-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 font-bold shadow-lg shadow-violet-500/20">
              H
            </div>

            <span className="font-semibold tracking-tight">
              The Humor Project
            </span>
          </div>

          {!user ? (
            <LoginButton />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {profile?.first_name
                  ? `Hi, ${profile.first_name} 👋`
                  : user.email}
              </Link>

              <LogoutButton />
            </div>
          )}
        </header>

        <section className="mb-14">
          <div className="mb-5 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
            Made by Matan
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            A tiny corner of the internet
            <span className="text-gray-500"> for questionable humor.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            A collection of awful memes.
          </p>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-gray-500">
                Latest entries
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Meme database
              </h2>
            </div>

            <span className="text-sm text-gray-500">
              {memes?.length ?? 0} memes
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {memes?.map((meme) => (
              <article
                key={meme.id}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.07]"
              >
                <span className="inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                  {meme.category}
                </span>

                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {meme.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-400">
                  {meme.caption}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {user && (!profile?.first_name || !profile?.last_name) && (
        <ProfileForm userId={user.id} />
      )}
    </main>
  );
}