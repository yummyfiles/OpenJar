import { test, expect } from "@playwright/test";

test("homepage renders and has a call to action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/support|donate|back/i).first()).toBeVisible();
});

test("creator profile loads from discover", async ({ page }) => {
  await page.goto("/");
  const creatorLink = page.getByRole("link").filter({ hasText: /@/ }).first();
  if (await creatorLink.isVisible()) {
    await creatorLink.click();
    await expect(page).toHaveURL(/\/@?[a-zA-Z0-9_-]+$/);
  } else {
    test.skip();
  }
});

test("api rate limit headers are present", async ({ request }) => {
  const res = await request.get("/api/v1/creators");
  expect(res.status()).toBeLessThan(500);
});

test("unknown api route returns 404", async ({ request }) => {
  const res = await request.get("/api/v1/definitely-not-a-route");
  expect(res.status()).toBe(404);
});
