import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: memes, error } = await supabase
    .from("memes")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 20px",
        background: "#111827",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>
          The Humor Project
        </h1>

        <p
          style={{
            opacity: 0.7,
            marginBottom: "40px",
          }}
        >
          Memes loaded from Supabase
        </p>

        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          {memes?.map((meme) => (
            <div
              key={meme.id}
              style={{
                padding: "24px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  opacity: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {meme.category}
              </span>

              <h2 style={{ margin: "10px 0" }}>
                {meme.title}
              </h2>

              <p style={{ opacity: 0.85 }}>
                {meme.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}