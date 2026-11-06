import { expect, test, type Page } from "@playwright/test";
import { backend, signIn } from "./fixtures";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const png = (name: string) => ({ name, mimeType: "image/png", buffer: PNG });

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

async function walkToPrice(page: Page) {
  await page.goto("/dashboard/products/new");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Kurtas" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator("input[type=file][multiple]").setInputFiles([png("a.png"), png("b.png")]);
  await expect(page.getByRole("img", { name: "Photo 2" })).toBeVisible();
  await page.getByRole("button", { name: "Move photo 2 earlier" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Product title").fill("Block print kurta");
  await page.getByLabel("Description").fill("Hand block printed in Jaipur on soft cotton.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Units in stock").fill("5");
  await page.getByRole("button", { name: "Continue" }).click();
}

test("wizard: submit for review sends no live flag", async ({ page }) => {
  const be = backend("IN");
  await signIn(page, "IN", be);
  await walkToPrice(page);
  await page.getByLabel(/Selling price/).fill("1499");
  await expect(page.getByText("You receive ₹1,244.17 after 17% commission")).toBeVisible();
  await expect(page.getByLabel("Live preview").getByText("Block print kurta")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page).toHaveURL(/submitted=1/);
  await expect(page.getByText(/Your product is In review/)).toBeVisible();
  expect(be.created).toHaveLength(1);
  expect(be.created[0]).toContain('name="price_inr"');
  expect(be.created[0]).not.toMatch(/is_live|approval_status|review_status/);
});

test("wizard: a draft survives a reload, stays local, and can be resumed", async ({ page }) => {
  const be = backend("IN");
  await signIn(page, "IN", be);
  await walkToPrice(page);
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText(/Draft saved on this device/)).toBeVisible();
  await page.goto("/dashboard/products");
  await expect(page.getByText("Block print kurta")).toBeVisible();
  await expect(page.getByText(/On this device/)).toBeVisible();
  expect(be.created).toHaveLength(0);
  await page.getByRole("link", { name: "Continue" }).click();
  await expect(page.getByLabel("Live preview").getByText("Block print kurta")).toBeVisible();
});

test("wizard: UAE electronics asks who ships; other categories do not", async ({ page }) => {
  await signIn(page, "AE");
  await page.goto("/dashboard/products/new");
  await expect(page.getByRole("list", { name: "Steps" }).getByRole("listitem")).toHaveCount(6);
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Mobile phones" }).click();
  await expect(page.getByRole("list", { name: "Steps" }).getByRole("listitem")).toHaveCount(7);
});

test("bulk: bad rows are held back with a reason; good rows go for review", async ({ page }) => {
  const be = backend("IN");
  await signIn(page, "IN", be);
  await page.goto("/dashboard/products/bulk");
  const csv = "name,description,category,price,mrp,sizes,stock,image_files\nGood tee,A heavy cotton tee here.,Kurtas,500,,,4,a.png\nBad,short,Nope,0,,,x,\n";
  await page.locator('input[accept*="csv"]').setInputFiles({ name: "p.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await expect(page.getByText(/0 ready, 2 to fix/)).toBeVisible();
  await expect(page.getByText(/Photo not chosen: a.png/)).toBeVisible();
  await page.locator('input[accept*="image"]').setInputFiles([png("a.png")]);
  await expect(page.getByText(/1 ready, 1 to fix/)).toBeVisible();
  await expect(page.getByText(/Category "Nope" not found/)).toBeVisible();
  await page.getByRole("button", { name: "Submit 1 for review" }).click();
  await expect(page.getByText("Submitted · In review")).toBeVisible();
  expect(be.created).toHaveLength(1);
});

test("orders: one tap to accept and to mark ready", async ({ page }) => {
  await signIn(page, "IN");
  await page.goto("/dashboard/orders");
  await expect(page.getByRole("tab")).toHaveText([/New/, /To pack/, /Shipped/, /Delivered/, /Returns/, /Cancelled/]);
  await page.getByRole("button", { name: "Accept order" }).click();
  await page.getByRole("tab", { name: /To pack/ }).click();
  await page.getByRole("button", { name: "Mark as ready" }).first().click();
  await expect(page.getByText(/Marked ready/).first()).toBeVisible();
});

test("orders: arrow keys move between tabs", async ({ page }) => {
  await signIn(page, "IN");
  await page.goto("/dashboard/orders");
  await page.getByRole("tab", { name: /New/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /To pack/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: /To pack/ })).toBeFocused();
});

test("orders: tracking on a seller-ships order uses /ship", async ({ page }) => {
  const be = backend("AE");
  await signIn(page, "AE", be);
  await page.goto("/dashboard/orders?tab=pack");
  await page.getByRole("button", { name: "Enter tracking" }).click();
  await page.getByLabel("Courier").fill("Aramex");
  await page.getByLabel("Tracking number").fill("AB12345");
  await page.getByRole("button", { name: "Save and mark shipped" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(be.orders.find((o) => o.ref_no === "NM-1003")?.bucket).toBe("shipped");
});

test("packing slip prints alone, with no prices", async ({ page }) => {
  await signIn(page, "IN");
  await page.goto("/dashboard/orders/NM-1002/slip");
  await expect(page.getByText("Packing slip").first()).toBeVisible();
  await page.emulateMedia({ media: "print" });
  expect(await page.locator(".sp-slip").evaluate((e) => getComputedStyle(e).visibility)).toBe("visible");
  expect(await page.locator(".sp-bottom").evaluate((e) => getComputedStyle(e).visibility)).toBe("hidden");
  expect(await page.locator(".sp-slip").innerText()).not.toMatch(/₹|commission/i);
});

test("payouts: calendar, wording, and the missing-bank banner", async ({ page }) => {
  await signIn(page, "AE", backend("AE"), { iban: null });
  await page.goto("/dashboard/payouts");
  await expect(page.getByText(/Settlement within 7 days/).first()).toBeVisible();
  await expect(page.getByText("Add your bank details.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Payout calendar" })).toBeVisible();
  await expect(page.locator(".sp-cal-list").getByText("Pending").first()).toBeVisible();
});

test("payouts: no banner when the IBAN is on file", async ({ page }) => {
  await signIn(page, "AE");
  await page.goto("/dashboard/payouts");
  await expect(page.getByRole("heading", { name: "Payout calendar" })).toBeVisible();
  await expect(page.getByText("Add your bank details.")).toHaveCount(0);
});

test("notifications: the badge uses the backend's count and clears through it", async ({ page }) => {
  await signIn(page, "IN");
  await page.goto("/dashboard");
  const bell = page.getByRole("button", { name: /Notifications, 1 unread/ }).first();
  await expect(bell).toBeVisible();
  const read = page.waitForRequest((r) => r.url().endsWith("/seller/notifications/read"));
  await bell.click();
  await page.getByRole("button", { name: "Mark all read" }).click();
  await read;
});
