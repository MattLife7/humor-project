export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #111827, #1f2937)",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          maxWidth: "600px",
        }}
      >
        <p
          style={{
            fontSize: "0.9rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          Designing for GenAI
        </p>

        <h1
          style={{
            fontSize: "4rem",
            margin: "0.5rem 0",
          }}
        >
          Hello World 👋
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            opacity: 0.85,
            lineHeight: 1.6,
          }}
        >
          <br />
          <strong>The Humor Project.</strong>
        </p>
      </div>
    </main>
  );
}