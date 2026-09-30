import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileEditor from "./profile-editor";

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
    <main className="min-h-screen bg-[#090b12] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-violet-300">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Your profile
          </h1>

          <p className="mt-3 text-gray-400">
            Update the information associated with your account.
          </p>
        </div>

        <ProfileEditor
          userId={user.id}
          email={user.email ?? ""}
          firstName={profile?.first_name ?? ""}
          lastName={profile?.last_name ?? ""}
          avatarUrl={profile?.avatar_url ?? ""}
        />
      </div>
    </main>
  );
}