// Changes to live products and "Add photos to existing products", in the browser, both countries, at 390 and 1280px.
// SHOTS=1 saves the screens for the PR to docs/pr-screenshots.
import { expect, test, type Page } from "@playwright/test";
import { audit } from "./audit";
import { backend, signIn, type Country } from "./fixtures";

async function shot(page: Page, name: string, width: number) {
  expect(await audit(page, width)).toEqual([]);
  if (process.env.SHOTS === "1") await page.screenshot({ path: `docs/pr-screenshots/changes-${name}-${width}.png`, fullPage: true });
}

for (const country of ["IN", "AE"] as Country[]) {
  for (const width of [390, 1280]) {
    test(`${country} ${width}px: catalogue shows change status; the edit stays live and a reorder is sent`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 780 : 900 });
      const be = backend(country);
      await signIn(page, country, be);
      await page.goto("/dashboard/products");
      await expect(page.getByText("Change pending approval")).toBeVisible();
      await expect(page.getByText("Change not approved")).toBeVisible();
      await expect(page.getByText(/higher than the market price/)).toBeVisible();
      await shot(page, `catalogue-${country.toLowerCase()}`, width);

      await page.getByRole("button", { name: "Changes pending" }).click();
      await expect(page.getByText("Block print cotton kurta")).toHaveCount(0);
      await page.getByRole("button", { name: "All" }).click();

      await page.getByRole("button", { name: "Edit" }).first().click();
      await expect(page.getByText(/A change is waiting for approval/)).toBeVisible();
      await expect(page.getByText(/offline/)).toHaveCount(0);
      await expect(page.getByText("Photos (3/8)")).toBeVisible();
      await page.getByRole("button", { name: "Move photo 3 left" }).click();
      await shot(page, `edit-${country.toLowerCase()}`, width);
      await page.getByRole("button", { name: "Save & send for approval" }).click();
      await expect(page.getByText(/sent for approval. Your product stays live/)).toBeVisible();
      const put = be.saved.find((s) => s.method === "PUT")!;
      expect(put.path).toBe("/seller/products/p1");
      expect(put.body).toContain("existing_images");
    });

    test(`${country} ${width}px: add photos from a pasted table: preview, errors, error file, send the valid rows`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 780 : 900 });
      const be = backend(country);
      await signIn(page, country, be);
      await page.goto("/dashboard/products");
      await page.getByRole("link", { name: "Add photos" }).click();
      await expect(page.getByRole("heading", { name: "Add photos to existing products" })).toBeVisible();
      await expect(page.getByText(/separated by \| with no spaces/).first()).toBeVisible();
      await page.getByRole("button", { name: "Paste or type" }).click();
      await page.getByLabel("Row 1 Product name").fill("hand-loomed cotton scarf with a rather long title for small  screens");
      await page.getByLabel("Row 1 Photo links or file names").fill("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing");
      await page.getByLabel("Row 2 Product name").fill("Twin cap");
      await page.getByLabel("Row 2 Photo links or file names").fill("cap.jpg");
      await page.getByLabel("Row 3 Product name").fill("Nobody's product");
      await page.getByLabel("Row 3 Photo links or file names").fill("x.jpg");
      await shot(page, `photos-paste-${country.toLowerCase()}`, width);
      await page.getByRole("button", { name: "Check rows" }).click();
      await expect(page.getByText("Preview: 1 ready, 2 with errors")).toBeVisible();
      await expect(page.getByText(/Row 3: 2 products ke naam same hain, product ID ya SKU bhi daalo/)).toBeVisible();
      await expect(page.getByText("Row 4: product nahi mila")).toBeVisible();
      await expect(page.getByText("3 → 4")).toBeVisible();
      await shot(page, `photos-preview-${country.toLowerCase()}`, width);

      const [file] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download error file" }).click()]);
      expect(file.suggestedFilename()).toBe("photo-rows-to-fix.csv");

      await page.getByRole("button", { name: "Send 1 ready row for approval" }).click();
      await expect(page.getByText("Sent for approval")).toBeVisible();
      await expect(page.getByText(/stay live as they are until NOTMADE approves/)).toBeVisible();
      expect(be.saved.filter((s) => s.path === "/seller/products/photos")).toHaveLength(1);
    });
  }
}

test("inventory: stock saves at once through PATCH /seller/inventory", async ({ page }) => {
  const be = backend("IN");
  await signIn(page, "IN", be);
  await page.goto("/dashboard/inventory");
  const input = page.getByRole("textbox", { name: /Stock for/ }).first();
  await input.fill("7");
  await input.press("Enter");
  await expect(page.getByText("Saved")).toBeVisible();
  expect(JSON.parse(be.saved.find((s) => s.method === "PATCH")!.body).items[0].stock).toBe(7);
});
