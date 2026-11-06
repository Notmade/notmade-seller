// Registration in a real browser against the stateful fake in signup-backend.ts, with the UAE open:
// from the sign-up button to the dashboard in both countries, and every new screen at phone widths.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { audit } from "./audit";
import { serveSignup, signedInSeller, type Country } from "./signup-backend";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const WIDTHS = [360, 390, 768];

/** Audits the screen, and saves it for the PR when SHOTS=1. */
async function check(page: Page, issues: string[], width: number, name: string) {
  await page.waitForTimeout(100);
  for (const issue of await audit(page, width)) issues.push(`${name} @${width}: ${issue}`);
  if (process.env.SHOTS === "1") await page.screenshot({ path: `docs/pr-screenshots/signup-${name}-${width}.png`, fullPage: true });
}

async function otp(page: Page) {
  await page.getByRole("group", { name: "6-digit code" }).getByRole("textbox").first().click();
  await page.keyboard.type("123456");
}

async function toOnboarding(page: Page, country: Country, issues: string[], width: number) {
  if (country === "AE") {
    await page.goto("/uae");
    await expect(page.getByText("Registrations opening soon")).toHaveCount(0);
    await page.getByRole("link", { name: "Register to sell" }).first().click();
    await page.waitForURL(/\/login/);
  } else {
    await page.goto("/login?apply=1");
    await check(page, issues, width, "login-country");
    await page.getByRole("button", { name: /India/ }).or(page.getByRole("link", { name: /India/ })).first().click();
  }
  await page.getByLabel("Work email").fill("new@brand.example");
  await page.getByRole("button", { name: "Send code" }).click();
  await otp(page);
  await page.waitForURL(/\/onboarding/);
}

async function fillIndia(page: Page) {
  await page.getByLabel("Legal name").fill("Test Brand Private Limited");
  await page.getByLabel("Brand / store name").fill("Test Brand");
  await page.getByLabel("Contact person").fill("Test Person");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByLabel("Address").fill("1 Test Street");
  await page.getByLabel("City").fill("Noida");
  await page.getByLabel("State").selectOption("Uttar Pradesh");
  await page.getByLabel("Pincode").fill("201301");
  await page.getByLabel("Yes, I have a GSTIN").check();
  await page.getByRole("textbox", { name: "GSTIN" }).fill("27ABCDE1234F1Z5");
}

async function fillUae(page: Page) {
  await page.getByLabel("Legal name").fill("Test Brand LLC");
  await page.getByLabel("Business / brand name").fill("Test Brand");
  await page.getByLabel("Contact person").fill("Test Person");
  await page.getByLabel("Mobile number").fill("501234567");
  await page.getByLabel("Address", { exact: true }).fill("1 Test Street");
  await page.getByLabel("City / area").fill("Ajman");
  await page.getByLabel("Emirate", { exact: true }).selectOption("Ajman");
  await page.getByLabel("Trade licence number").fill("CN-1234567");
  await page.getByLabel("Passport").check();
  await page.getByLabel("Bank IBAN").fill("AE07 0331 2345 6789 0123 456");
}

async function signAgreement(page: Page, issues: string[], width: number, country: string) {
  await expect(page.getByRole("button", { name: /Send signing code/ })).toBeDisabled();
  await check(page, issues, width, `${country}-agreement`);
  await page.locator(".agreement-doc-box").evaluate((e) => { e.scrollTop = e.scrollHeight; });
  await page.getByRole("checkbox").check();
  await check(page, issues, width, `${country}-agreement-end`);
  await page.getByRole("button", { name: /Send signing code/ }).click();
  await page.getByLabel("Email code").fill("123456");
  await page.getByRole("button", { name: "Sign agreement", exact: true }).click();
}

for (const width of WIDTHS) {
  test(`UAE: sign-up button to dashboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const s = await serveSignup(page);
    const issues: string[] = [];
    await toOnboarding(page, "AE", issues, width);

    await check(page, issues, width, "country");
    await expect(page.getByRole("button", { name: /UAE/ })).toContainText("Prices and payouts in AED");
    await page.getByRole("button", { name: /UAE/ }).click();
    await expect(page.getByText("Mobile phones & laptops")).toBeVisible();
    await expect(page.getByText("Handmade products")).toBeVisible();
    await page.getByLabel(/I ship · 12%/).check();
    await expect(page.getByText(/Who ships does not change it/)).toBeVisible();
    await fillUae(page);
    await check(page, issues, width, "uae-details");
    await page.getByRole("button", { name: /Save & continue/ }).click();

    await expect(page.getByRole("heading", { name: "Upload KYC documents" })).toBeVisible();
    await check(page, issues, width, "uae-documents");
    // The last required document moves the seller on to the agreement
    await page.locator("input[type=file]").nth(0).setInputFiles({ name: "doc.png", mimeType: "image/png", buffer: PNG });
    await expect(page.getByText("Uploaded doc.png")).toBeVisible();
    await page.locator("input[type=file]").nth(1).setInputFiles({ name: "doc.png", mimeType: "image/png", buffer: PNG });

    await expect(page.getByRole("heading", { name: "NOTMADE Seller Agreement — UAE" })).toBeVisible();
    await expect(page.locator(".agreement-doc-box")).toContainText("HOUSE OF NOTMADE STUDIO FZE LLC");
    await expect(page.getByText(/Version uae-local-v3 · Rate card AE-2026-11-v2/)).toBeVisible();
    await expect(page.getByText("Handmade 14%")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("null%");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download" }).click()]);
    expect(download.suggestedFilename()).toContain("uae-local-v3");
    expect(readFileSync(await download.path(), "utf8")).toContain("HOUSE OF NOTMADE STUDIO FZE LLC");
    await signAgreement(page, issues, width, "uae");

    await page.waitForURL(/\/dashboard$/);
    await expect(page.getByText("Agreement signed.")).toBeVisible();
    await expect(page.getByText("Application under review")).toHaveCount(0);
    await expect(page.getByText("Add bank details to receive payouts.")).toHaveCount(0);
    await check(page, issues, width, "uae-dashboard");
    expect(s.signups[0]).toMatchObject({ seller_country: "AE", default_fulfilment_mode: "seller_ships", iban: "AE070331234567890123456" });
    expect(s.signups[0]).not.toHaveProperty("electronics_fulfilment");
    expect(issues).toEqual([]);
  });

  test(`India: sign-up to payouts unblocked at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const s = await serveSignup(page);
    const issues: string[] = [];
    await toOnboarding(page, "IN", issues, width);

    await page.getByRole("button", { name: /India/ }).click();
    await expect(page.getByText(/Fashion and all other categories 17%/)).toBeVisible();
    await expect(page.getByText("Who ships your phones and laptops?")).toHaveCount(0);
    await fillIndia(page);
    await check(page, issues, width, "india-details");
    await page.getByRole("button", { name: /Save & continue/ }).click();

    await expect(page.getByRole("heading", { name: "Upload KYC documents" })).toBeVisible();
    await page.locator("input[type=file]").first().setInputFiles({ name: "doc.png", mimeType: "image/png", buffer: PNG });

    await expect(page.getByRole("heading", { name: "NOTMADE Seller Agreement", exact: true })).toBeVisible();
    await expect(page.getByText(/Version in-v3/)).toBeVisible();
    await expect(page.locator("body")).not.toContainText("null%");
    await signAgreement(page, issues, width, "india");

    await page.waitForURL(/\/dashboard$/);
    await expect(page.getByText("Add bank details to receive payouts.")).toBeVisible();
    await check(page, issues, width, "india-dashboard");

    await page.getByRole("link", { name: "Add bank details" }).click();
    await page.waitForURL(/\/dashboard\/profile/);
    await page.getByRole("button", { name: "Add bank details" }).click();
    await page.getByLabel("Account number").fill("123456789012");
    await page.getByLabel("IFSC").fill("hdfc0001234");
    await page.getByLabel("Account holder name").fill("Test Brand");
    await check(page, issues, width, "india-bank-form");
    await page.getByRole("button", { name: "Save bank details" }).click();
    await expect(page.getByText("•••• 9012")).toBeVisible();
    await check(page, issues, width, "india-bank-saved");
    expect(s.bankBodies[0]).toMatchObject({ account_number: "123456789012", ifsc: "HDFC0001234" });

    await page.goto("/dashboard/payouts");
    await expect(page.getByRole("heading", { name: "Payouts" })).toBeVisible();
    await expect(page.getByText("Add bank details to receive payouts.")).toHaveCount(0);
    expect(issues).toEqual([]);
  });

  test(`product in review on the dashboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.context().addCookies([{ name: "nm_seller", value: "1", url: "http://localhost:3101" }]);
    await page.addInitScript(() => localStorage.setItem("nm_seller_token", "test-token"));
    await serveSignup(page, { ...signedInSeller("IN"), products: [{ id: "p1", name: "Block print kurta", approval_status: "pending", is_live: false, images: [], stock: 3, price_inr: 1499, product_variants: [], created_at: "2026-11-06T10:00:00.000Z" }] });
    await page.goto("/dashboard");
    await expect(page.getByText("Product submitted, in review.")).toBeVisible();
    const issues: string[] = [];
    await check(page, issues, width, "in-review");
    expect(issues).toEqual([]);
  });
}

test("a seller the backend sends to an admin sees the review state, not the dashboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.context().addCookies([{ name: "nm_seller", value: "1", url: "http://localhost:3101" }]);
  await page.addInitScript(() => localStorage.setItem("nm_seller_token", "test-token"));
  const fixture = signedInSeller("IN");
  await serveSignup(page, { ...fixture, seller: { ...fixture.seller, onboarding_status: "pending_review" }, uploaded: ["gst_certificate"] });
  await page.goto("/onboarding");
  await expect(page.getByRole("heading", { name: "Application under review" })).toBeVisible();
  await page.getByRole("button", { name: "3 Sign agreement" }).click();
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Send signing code/ })).toHaveCount(0);
});

test("the public rate card renders from the live backend", async ({ page }) => {
  test.skip(process.env.E2E_LIVE !== "1", "Reads production: set E2E_LIVE=1");
  await page.context().addCookies([{ name: "nm_seller", value: "1", url: "http://localhost:3101" }]);
  await page.addInitScript(() => localStorage.setItem("nm_seller_token", "test-token"));
  await serveSignup(page);
  await page.goto("/onboarding?market=ae");
  await page.getByRole("button", { name: /UAE/ }).click();
  await expect(page.getByRole("heading", { name: "Your commission rate card" })).toBeVisible();
  await expect(page.getByLabel(/I ship · \d+%/)).toBeVisible();
  await expect(page.locator("section[aria-labelledby=rate-card-h] li")).toHaveCount(3);
});
