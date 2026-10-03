"use client";

/** Laatste vangnet: een fout in de root-layout zelf. Moet zijn eigen <html> renderen en kan geen globals.css aannemen. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="nl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          font: "15px/1.5 system-ui, sans-serif",
          background: "#fafafa",
          color: "#111",
        }}
      >
        <div style={{ maxWidth: "28rem", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Deze pagina laadde niet</h1>
          <p style={{ color: "#4b5563", margin: "0 0 1.5rem" }}>
            Er ging iets mis aan onze kant. Probeer het opnieuw.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: 0,
              background: "#111",
              color: "#fff",
              font: "inherit",
              cursor: "pointer",
            }}
          >
            Probeer opnieuw
          </button>
        </div>
      </body>
    </html>
  );
}
