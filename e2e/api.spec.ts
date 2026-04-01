import { test, expect } from "@playwright/test";

test.describe("GET /api/markets", () => {
  test("returns 200 with correct content-type", async ({ request }) => {
    const response = await request.get("/api/markets");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
  });

  test("response contains a markets array with three entries", async ({
    request,
  }) => {
    const response = await request.get("/api/markets");
    const body = await response.json();

    expect(body).toHaveProperty("markets");
    expect(Array.isArray(body.markets)).toBe(true);
    expect(body.markets).toHaveLength(3);
  });

  test("each market has id, title, probability, and category fields", async ({
    request,
  }) => {
    const response = await request.get("/api/markets");
    const { markets } = await response.json();

    for (const market of markets) {
      expect(market).toHaveProperty("id");
      expect(market).toHaveProperty("title");
      expect(market).toHaveProperty("probability");
      expect(market).toHaveProperty("category");
    }
  });

  test("market probabilities are numbers between 0 and 100", async ({
    request,
  }) => {
    const response = await request.get("/api/markets");
    const { markets } = await response.json();

    for (const market of markets) {
      expect(typeof market.probability).toBe("number");
      expect(market.probability).toBeGreaterThanOrEqual(0);
      expect(market.probability).toBeLessThanOrEqual(100);
    }
  });

  test("market ids are unique positive integers", async ({ request }) => {
    const response = await request.get("/api/markets");
    const { markets } = await response.json();

    const ids = markets.map((m: { id: number }) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(markets.length);
    for (const id of ids) {
      expect(typeof id).toBe("number");
      expect(id).toBeGreaterThan(0);
    }
  });

  test("returns the three expected markets", async ({ request }) => {
    const response = await request.get("/api/markets");
    const { markets } = await response.json();

    const titles = markets.map((m: { title: string }) => m.title);
    expect(titles).toContain("Will AI forecasting improve decision-making?");
    expect(titles).toContain(
      "Will market-simulation tools outperform polling?"
    );
    expect(titles).toContain(
      "Will decentralized reputation improve signal quality?"
    );
  });
});
