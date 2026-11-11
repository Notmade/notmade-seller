// Every panel page at four widths: nothing sideways, no small tap targets, nothing under the bottom nav.
import { expect, test } from "@playwright/test";
import { audit } from "./audit";
import { signIn, type Country } from "./fixtures";

const PAGES = ["/dashboard", "/dashboard/orders", "/dashboard/orders?tab=pack", "/dashboard/products", "/dashboard/products/new", "/dashboard/products/bulk", "/dashboard/products/photos", "/dashboard/inventory",
  "/dashboard/analytics", "/dashboard/delivery", "/dashboard/payouts", "/dashboard/notifications", "/dashboard/agreement", "/dashboard/profile", "/dashboard/orders/NM-1002/slip"];
const WIDTHS = [360, 390, 768, 1280];

for (const country of ["IN", "AE"] as Country[]) {
  for (const width of WIDTHS) {
    test(`${country} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 780 : 900 });
      await signIn(page, country);
      const all: string[] = [];
      for (const path of PAGES) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(150);
        for (const issue of await audit(page, width)) all.push(`${path}: ${issue}`);
        if (width < 1024) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          const clear = await page.evaluate(() => {
            const nav = document.querySelector(".sp-bottom")?.getBoundingClientRect();
            const last = document.querySelector(".sp-page")?.lastElementChild?.getBoundingClientRect();
            return !nav || !last || last.bottom <= nav.top + 1;
          });
          if (!clear) all.push(`${path}: content ends under the bottom nav`);
        }
      }
      expect(all).toEqual([]);
    });
  }
}
