import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const trackReveal = (page: Page) => page.addInitScript(() => addEventListener("pagereveal", (e) => { sessionStorage.setItem("vt", String(!!(e as Event & { viewTransition?: unknown }).viewTransition)); }));

test("the switcher flips India to the UAE and back", async ({ page }) => {
  await trackReveal(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("India");
  await page.getByRole("link", { name: "UAE" }).first().click();
  await expect(page).toHaveURL(/\/uae$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("sales channel");
  expect(await page.evaluate(() => sessionStorage.getItem("vt"))).toBe("true");
  await page.getByRole("link", { name: "India" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("India");
  expect(await page.evaluate(() => sessionStorage.getItem("vt"))).toBe("true");
});

test("reduced motion: no flip, the link still works", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trackReveal(page);
  await page.goto("/");
  await page.getByRole("link", { name: "UAE" }).first().click();
  await expect(page).toHaveURL(/\/uae$/);
  expect(await page.evaluate(() => sessionStorage.getItem("vt"))).toBe("false");
  expect(await page.locator(".n-stage").evaluate((e) => getComputedStyle(e).animationName)).toBe("none");
});

test("low-end device: flat and no flip", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "deviceMemory", { get: () => 1 }));
  await trackReveal(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/n-lite/);
  expect(await page.locator(".n-stack").evaluate((e) => getComputedStyle(e).transform)).toBe("none");
  await page.getByRole("link", { name: "UAE" }).first().click();
  await expect(page).toHaveURL(/\/uae$/);
});

test("other links on the landing do not flip", async ({ page }) => {
  await trackReveal(page);
  await page.goto("/");
  await page.locator(".n-logo").first().click();
  await page.waitForLoadState();
  expect(await page.evaluate(() => sessionStorage.getItem("vt"))).toBe("false");
});

for (const width of [360, 390, 768, 1280]) {
  test(`both landings fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ["/", "/uae"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
  });
}
