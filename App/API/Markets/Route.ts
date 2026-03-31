export async function GET() {
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

  return Response.json({ markets });
}
