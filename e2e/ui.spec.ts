import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/HF-Arenas/i);
  });

  test("renders header with site name and navigation", async ({ page }) => {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: "Markets" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Topics" })).toBeVisible();
    await expect(page.getByRole("link", { name: "API" })).toBeVisible();
  });

  test("renders HF-Arenas heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "HF-Arenas", level: 1 })
    ).toBeVisible();
  });

  test("displays all three market cards", async ({ page }) => {
    await expect(
      page.getByText("Will AI forecasting improve decision-making?")
    ).toBeVisible();
    await expect(
      page.getByText("Will market-simulation tools outperform polling?")
    ).toBeVisible();
    await expect(
      page.getByText("Will decentralized reputation improve signal quality?")
    ).toBeVisible();
  });

  test("shows market probabilities", async ({ page }) => {
    await expect(page.getByText("72%")).toBeVisible();
    await expect(page.getByText("64%")).toBeVisible();
    await expect(page.getByText("58%")).toBeVisible();
  });

  test("shows market categories", async ({ page }) => {
    await expect(page.getByText("AI / Research")).toBeVisible();
    await expect(page.getByText("Forecasting")).toBeVisible();
    await expect(page.getByText("Web3 / Identity")).toBeVisible();
  });

  test("renders GitHub Topics section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "GitHub Topics" })
    ).toBeVisible();
    await expect(page.getByText("forecasting")).toBeVisible();
    await expect(page.getByText("prediction-markets")).toBeVisible();
  });

  test("renders Backend API section with /api/markets link", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Backend API" })
    ).toBeVisible();
    await expect(page.getByText("/api/markets")).toBeVisible();
  });
});
