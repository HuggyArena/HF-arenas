import Header from "../components/Header";
import MarketCard from "../components/MarketCard";

const markets = [
  {
    id: 1,
    title: "Will AI forecasting improve decision-making?",
    probability: 72,
    category: "AI / Research",
  },
  {
    id: 2,
    title: "Will market-simulation tools outperform polling?",
    probability: 64,
    category: "Forecasting",
  },
  {
    id: 3,
    title: "Will decentralized reputation improve signal quality?",
    probability: 58,
    category: "Web3 / Identity",
  },
];

const topics = [
  "forecasting",
  "prediction-markets",
  "market-simulation",
  "collective-intelligence",
  "ai",
  "llm",
  "hugging-face",
  "web3",
  "crypto",
  "community-platform",
];

export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 48px" }}>
      <Header />

      <section style={{ padding: "40px 0 28px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid #334155",
            marginBottom: 16,
            color: "#93c5fd",
          }}
        >
          Forecasting · AI · Collective Intelligence
        </div>

        <h1 style={{ fontSize: "3rem", lineHeight: 1.05, margin: "0 0 14px" }}>
          HF-Arenas
        </h1>

        <p style={{ maxWidth: 760, color: "#94a3b8", fontSize: "1.05rem" }}>
          A forecasting and market-simulation platform for collective
          intelligence, community signal discovery, and AI-assisted market
          interfaces.
        </p>
      </section>

      <section id="markets" style={{ display: "grid", gap: 16 }}>
        {markets.map((market) => (
          <MarketCard key={market.id} {...market} />
        ))}
      </section>

      <section id="topics" style={{ marginTop: 40 }}>
        <h2>GitHub Topics</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {topics.map((topic) => (
            <span
              key={topic}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: "#172033",
                border: "1px solid #334155",
                color: "#93c5fd",
                fontWeight: 700,
              }}
            >
              {topic}
            </span>
          ))}
        </div>
      </section>

      <section id="api" style={{ marginTop: 40 }}>
        <h2>Backend API</h2>
        <p style={{ color: "#94a3b8" }}>
          Starter route included at <code>/api/markets</code>
        </p>
      </section>
    </main>
  );
}
