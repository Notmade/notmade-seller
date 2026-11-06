// @vitest-environment jsdom
// Registration for both countries against a mocked API. The rate cards below are copied from the live
// GET /seller/commission-rates, so a card shape the panel cannot read fails here first.
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AgreementSigner, agreementPills } from "@/app/components/AgreementSigner";
import { BankDetailsCard, PayoutBlockedNotice } from "@/app/components/BankDetails";
import UaeLanding from "@/app/components/landing/UaeLanding";
import { SignupCountriesProvider } from "@/app/components/market";
import OnboardingPage from "@/app/onboarding/page";
import { api, ApiError, clearSession, type Agreement, type CommissionRates, type Seller } from "@/app/lib/seller-api";
import { SELL_CATEGORIES_KEY, UNASKED_FULFILMENT_MODE, fulfilmentModeToSend, loadSellCategories, saveSellCategories } from "@/app/lib/sell-categories";
import { categoryRate, listingRate, rateCardLines, usableCard, whoShipsChangesRate, whoShipsRate, type RateCard } from "@/app/lib/rate-card";
import { validateBank } from "@/app/lib/validate";

const nav = vi.hoisted(() => ({ seller: null as unknown, replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace, push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/onboarding",
  useSearchParams: () => new URLSearchParams("market=ae"),
}));
vi.mock("@/app/lib/useSeller", () => ({
  useSeller: () => ({ state: { status: "ready", seller: nav.seller }, reload: vi.fn(), signOut: vi.fn() }),
}));
vi.mock("next/link", () => ({ default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a> }));

const AE_V2: RateCard = {
  version: "AE-2026-11-v2", effective_from: "2026-11-06T13:56:00.612317+00:00",
  groups: [
    { key: "phones_laptops", label: "Mobile phones & laptops", shipping_included: false, rates: [{ fulfilment_mode: null, pct: 12 }] },
    { key: "handmade", label: "Handmade products", shipping_included: false, rates: [{ fulfilment_mode: null, pct: 14 }] },
    { key: "default", label: "Apparel & all other categories", shipping_included: false, rates: [{ fulfilment_mode: null, pct: 17 }] },
  ],
};
const AE_V3: RateCard = {
  version: "AE-2026-11-v3", effective_from: "2026-11-06T18:30:29.87542+00:00",
  groups: [
    { key: "phones_laptops", label: "Mobile phones & laptops", shipping_included: false, rates: [
      { fulfilment_mode: "seller_ships", pct: 12, commission_pct: 12, shipping_charge_pct: 0 },
      { fulfilment_mode: "notmade_ships", pct: 13.5, commission_pct: 12, shipping_charge_pct: 1.5 },
    ] },
    { key: "handmade", label: "Handmade products", shipping_included: false, rates: [{ fulfilment_mode: null, pct: 14 }] },
    { key: "default", label: "Apparel & all other categories", shipping_included: false, rates: [{ fulfilment_mode: null, pct: 17 }] },
  ],
};
const IN_V2: RateCard = {
  version: "IN-2026-11-v2", effective_from: "2026-11-06T13:56:00.605118+00:00",
  groups: [
    { key: "handmade", label: "Handmade products", shipping_included: true, rates: [{ fulfilment_mode: null, pct: 15 }] },
    { key: "default", label: "Fashion & all other categories", shipping_included: true, rates: [{ fulfilment_mode: null, pct: 17 }] },
  ],
};
// Sellers stamped on the earlier card keep it, and it is the only card where who ships sets the rate
const AE_V1: RateCard = {
  version: "AE-2026-11-v1",
  groups: [
    { key: "electronics", label: "Electronics", shipping_included: false, rates: [{ fulfilment_mode: "seller_ships", pct: 12 }, { fulfilment_mode: "notmade_ships", pct: 14 }] },
    { key: "fashion_accessories", label: "Fashion & Accessories", shipping_included: true, rates: [{ fulfilment_mode: null, pct: 17 }] },
  ],
};

const rates = (uae: RateCard | null): CommissionRates => ({ india_pct: 17, uae_local_pct: 17, uae_rate_card: uae, india_rate_card: IN_V2 });

const agreement = (over: Partial<Agreement> = {}): Agreement => ({
  version: "uae-local-v3", title: "NOTMADE Seller Agreement — UAE", text: "x", html: "<p><strong>HOUSE OF NOTMADE STUDIO FZE LLC</strong></p>", plain_text: "HOUSE OF NOTMADE STUDIO FZE LLC",
  agreement_hash: "a".repeat(64), pricing_model: "seller_controlled", commission_rate: null, includes_uae_clause: true, signed: false,
  commission_terms: { basis: "rate_card", version: "AE-2026-11-v2", effective_from: AE_V2.effective_from!, pct: null, default_fulfilment_mode: "seller_ships", phones_laptops: 12, handmade: 14, default: 17 },
  ...over,
});

const seller = { id: "s1", email: "new@brand.ae", contact_name: "Test Person", legal_name: "Test Brand LLC", business_name: "Test Brand" } as Seller;

function renderOnboarding() {
  return render(<SignupCountriesProvider countries={["IN", "AE"]}><OnboardingPage /></SignupCountriesProvider>);
}

const type = (id: string, value: string) => fireEvent.change(document.getElementById(id)!, { target: { value } });

async function toRateStep() {
  renderOnboarding();
  fireEvent.click(screen.getByRole("button", { name: /UAE/ }));
  await screen.findByRole("heading", { name: "What do you sell?" });
}

async function fillUaeForm(categories: string[], whoShips?: RegExp) {
  await toRateStep();
  for (const label of categories) fireEvent.click(screen.getByLabelText(label));
  if (whoShips) fireEvent.click(screen.getByLabelText(whoShips));
  fireEvent.click(screen.getByRole("button", { name: /^Continue/ }));
  for (const [id, v] of [["legal_name", "Test Brand LLC"], ["business_name", "Test Brand"], ["contact_name", "Test Person"], ["phone", "501234567"], ["address_line", "1 Test Street"],
    ["city", "Ajman"], ["emirate", "Ajman"], ["trade_licence_number", "cn-1234567"], ["iban", "AE07 0331 2345 6789 0123 456"]]) type(id, v);
  fireEvent.click(screen.getByLabelText("Passport"));
}

beforeEach(() => { nav.seller = null; nav.replace.mockClear(); localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("rate cards come from the backend only", () => {
  it("reads the live v2 card, where who ships sets no rate", () => {
    expect(rateCardLines(AE_V2)).toEqual(["Mobile phones & laptops: 12%", "Handmade products: 14%", "Apparel & all other categories: 17%"]);
    expect(whoShipsRate(usableCard(AE_V2), "seller_ships")).toBe(12);
    expect(whoShipsRate(usableCard(AE_V2), "notmade_ships")).toBe(12);
    expect(whoShipsChangesRate(usableCard(AE_V2))).toBe(false);
  });

  it("still reads a v1 card, where who ships does", () => {
    expect(rateCardLines(AE_V1)).toEqual(["Electronics: 12% if you ship, 14% if NOTMADE ships", "Fashion & Accessories: 17%, shipping included"]);
    expect(whoShipsChangesRate(usableCard(AE_V1))).toBe(true);
  });

  it("has nothing to show without a card, or with a broken one", () => {
    expect(usableCard(null)).toBeNull();
    expect(rateCardLines({} as RateCard)).toEqual([]);
    expect(usableCard({ groups: [{ key: "default", label: "x", shipping_included: false, rates: [{ fulfilment_mode: null, pct: 900 }] }] })).toBeNull();
  });

  it("prices a category like the backend does", () => {
    expect(categoryRate(IN_V2, "handmade")).toBe(15);
    expect(categoryRate(IN_V2, "unmapped")).toBe(17);
    expect(categoryRate(AE_V1, "electronics", "seller_ships")).toBe(12);
    expect(categoryRate(AE_V1, "electronics")).toBe(14);
    expect(categoryRate(null, "handmade")).toBeNull();
  });

  it("quotes a handmade listing at its own rate, and legacy sellers at their flat one", () => {
    const onCard = { rate_card: IN_V2, commission: { india_pct: 17 } };
    expect(listingRate(onCard, { commission_group: "handmade" })).toBe(15);
    expect(listingRate({ rate_card: null, commission: { india_pct: 20 } }, {})).toBe(20);
    expect(listingRate({ rate_card: AE_V2, commission: { india_pct: null } }, undefined)).toBeNull();
  });
});

describe("UAE registration", () => {
  const continueBtn = () => screen.getByRole("button", { name: /^Continue/ }) as HTMLButtonElement;
  const pick = (label: string | RegExp) => fireEvent.click(screen.getByLabelText(label));

  it("asks what the seller sells first, and Continue waits for at least one", async () => {
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    await toRateStep();
    expect(document.getElementById("trade_licence_number")).toBeNull();
    expect(continueBtn().disabled).toBe(true);
    expect(screen.queryByText("Who ships your phones and laptops?")).toBeNull();
    pick("Handmade products");
    expect(continueBtn().disabled).toBe(false);
    pick("Handmade products");
    expect(continueBtn().disabled).toBe(true);
  });

  it("shows the live rate of each chosen category only", async () => {
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates({ ...AE_V3, groups: AE_V3.groups.map(g => g.key === "handmade" ? { ...g, rates: [{ fulfilment_mode: null, pct: 15.5 }] } : g) }));
    await toRateStep();
    expect(document.body.textContent).not.toMatch(/\d+%/);
    pick("Handmade products");
    expect(document.querySelector("ul[aria-live]")!.textContent).toBe("Handmade products15.5%");
    pick("Apparel and all other categories");
    expect(document.querySelector("ul[aria-live]")!.textContent).toContain("Apparel and all other categories17%");
    expect(document.body.textContent).not.toContain("13.5%");
  });

  it("asks who ships only for phones and laptops, with both live options, and Continue waits for the answer", async () => {
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    await toRateStep();
    pick("Mobile phones and laptops");
    expect(screen.getByText("Who ships your phones and laptops?")).toBeTruthy();
    expect(document.querySelector("ul[aria-live]")!.textContent).toContain("12% if you ship, 13.5% if NOTMADE ships");
    expect(screen.getByText(/You can change this until you sign your agreement\./)).toBeTruthy();
    expect(continueBtn().disabled).toBe(true);
    screen.getByLabelText(/^I ship, 12%/);
    pick("NOTMADE ships, 13.5% (12% + 1.5% NOTMADE shipping charge, flat, no VAT added)");
    expect(document.querySelector("ul[aria-live]")!.textContent).toBe("Mobile phones and laptops13.5%");
    expect(continueBtn().disabled).toBe(false);
    pick(/^I ship, 12%/);
    expect(document.querySelector("ul[aria-live]")!.textContent).toBe("Mobile phones and laptops12%");
  });

  it("forgets who ships when phones and laptops are dropped, and asks again if they come back", async () => {
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    await toRateStep();
    pick("Mobile phones and laptops");
    pick(/^I ship, 12%/);
    pick("Mobile phones and laptops");
    expect(screen.queryByText("Who ships your phones and laptops?")).toBeNull();
    pick("Mobile phones and laptops");
    expect((screen.getByLabelText(/^I ship, 12%/) as HTMLInputElement).checked).toBe(false);
    expect(continueBtn().disabled).toBe(true);
  });

  it("reads a card with one phones rate", async () => {
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V2));
    await toRateStep();
    pick("Mobile phones and laptops");
    expect(screen.getByLabelText(/^NOTMADE ships, 12%/)).toBeTruthy();
    expect(document.body.textContent).not.toContain("shipping charge");
  });

  it("states no rate when the card cannot be read, and still asks who ships", async () => {
    vi.spyOn(api, "commissionRates").mockRejectedValue(new ApiError(500, "down", {}));
    await toRateStep();
    pick("Mobile phones and laptops");
    expect(screen.getByText(/set out in your agreement/)).toBeTruthy();
    expect(screen.getByLabelText(/I ship/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/\d+%/);
  });

  it("sends the chosen who ships, and no field the contract does not have", async () => {
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    const signup = vi.spyOn(api, "signup").mockRejectedValue(new ApiError(400, "stop here", {}));
    await fillUaeForm(["Mobile phones and laptops", "Handmade products"], /^I ship, 12%/);
    fireEvent.click(screen.getByRole("button", { name: /Save & continue/ }));
    await waitFor(() => expect(signup).toHaveBeenCalled());
    const body = signup.mock.calls[0][0];
    expect(body).toMatchObject({ seller_country: "AE", default_fulfilment_mode: "seller_ships", iban: "AE070331234567890123456", trade_licence_number: "CN-1234567", uae_id_type: "passport", emirate: "Ajman" });
    for (const field of ["electronics_fulfilment", "gstin", "categories", "sell_category"]) expect(body).not.toHaveProperty(field);
    expect(loadSellCategories()).toEqual(["phones_laptops", "handmade"]);
  });

  it("sends the backend's own fallback for a seller without phones, because sign-up refuses none", async () => {
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    const signup = vi.spyOn(api, "signup").mockRejectedValue(new ApiError(400, "stop here", {}));
    await fillUaeForm(["Handmade products"]);
    expect(screen.getByText(/You sell:/).parentElement!.textContent).toContain("Handmade products");
    fireEvent.click(screen.getByRole("button", { name: /Save & continue/ }));
    await waitFor(() => expect(signup).toHaveBeenCalled());
    expect(signup.mock.calls[0][0].default_fulfilment_mode).toBe(UNASKED_FULFILMENT_MODE);
    expect(UNASKED_FULFILMENT_MODE).toBe("notmade_ships");
  });

  it("goes back to the rate step from the details form with the choices kept", async () => {
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    await fillUaeForm(["Mobile phones and laptops"], /^I ship, 12%/);
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(((await screen.findByLabelText(/^I ship, 12%/)) as HTMLInputElement).checked).toBe(true);
  });

  it("brings a phones seller's answer back when they re-open their details", async () => {
    saveSellCategories(["phones_laptops"]);
    nav.seller = { ...seller, seller_country: "AE", onboarding_status: "pending_agreement", default_fulfilment_mode: "seller_ships" };
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    vi.spyOn(api, "onboardingStatus").mockResolvedValue({ next_step: "details", onboarding_status: "pending_agreement" } as never);
    renderOnboarding();
    fireEvent.click(await screen.findByRole("button", { name: "Change" }));
    expect(((await screen.findByLabelText(/^I ship, 12%/)) as HTMLInputElement).checked).toBe(true);
  });

  it("never shows a value the seller was not asked for as their answer", async () => {
    nav.seller = { ...seller, seller_country: "AE", onboarding_status: "pending_agreement", default_fulfilment_mode: "notmade_ships" };
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    vi.spyOn(api, "onboardingStatus").mockResolvedValue({ next_step: "details", onboarding_status: "pending_agreement" } as never);
    renderOnboarding();
    fireEvent.click(await screen.findByLabelText("Mobile phones and laptops"));
    expect((screen.getByLabelText(/^NOTMADE ships, 13\.5%/) as HTMLInputElement).checked).toBe(false);
  });

  it("leaves a stored answer alone when phones and laptops are not chosen", () => {
    expect(fulfilmentModeToSend(["handmade"], "", "seller_ships")).toBeUndefined();
    expect(fulfilmentModeToSend(["handmade"], "", null)).toBe("notmade_ships");
    expect(fulfilmentModeToSend(["phones_laptops"], "seller_ships", "notmade_ships")).toBe("seller_ships");
  });

  it("shows a locked seller their answer on another device, read-only", async () => {
    nav.seller = { ...seller, seller_country: "AE", onboarding_status: "pending_review", default_fulfilment_mode: "seller_ships" };
    vi.spyOn(api, "commissionRates").mockResolvedValue(rates(AE_V3));
    vi.spyOn(api, "onboardingStatus").mockResolvedValue({ next_step: "details", onboarding_status: "pending_review" } as never);
    renderOnboarding();
    const choice = await screen.findByLabelText(/^I ship, 12%/) as HTMLInputElement;
    expect(choice.checked).toBe(true);
    expect(choice.closest("fieldset")!.disabled).toBe(true);
    expect(screen.queryByRole("button", { name: /^Continue/ })).toBeNull();
  });

  it("keeps stored categories valid, and clears them with the session", () => {
    localStorage.setItem(SELL_CATEGORIES_KEY, JSON.stringify(["handmade", "nonsense"]));
    expect(loadSellCategories()).toEqual(["handmade"]);
    localStorage.setItem(SELL_CATEGORIES_KEY, "{not json");
    expect(loadSellCategories()).toEqual([]);
    saveSellCategories(["default"]);
    clearSession();
    expect(loadSellCategories()).toEqual([]);
  });
});

describe("after signing", () => {
  it("goes straight to the dashboard, with no review step or wait", async () => {
    nav.seller = { ...seller, seller_country: "AE", onboarding_status: "approved" };
    vi.spyOn(api, "onboardingStatus").mockResolvedValue({ next_step: "done", onboarding_status: "approved" } as never);
    renderOnboarding();
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("does not promise a review to a seller still signing up", async () => {
    nav.seller = { ...seller, seller_country: "AE", onboarding_status: "pending_agreement" };
    vi.spyOn(api, "onboardingStatus").mockResolvedValue({ next_step: "agreement", onboarding_status: "pending_agreement" } as never);
    vi.spyOn(api, "agreement").mockResolvedValue(agreement());
    renderOnboarding();
    await screen.findByText(/HOUSE OF NOTMADE STUDIO FZE LLC/);
    expect(screen.queryByRole("button", { name: /Review/ })).toBeNull();
    expect(document.body.textContent).not.toMatch(/48 hours|our team will review/i);
  });

  it("is honest with the sellers the backend still sends to an admin", async () => {
    nav.seller = { ...seller, seller_country: "IN", onboarding_status: "pending_review" };
    vi.spyOn(api, "onboardingStatus").mockResolvedValue({ next_step: "review", onboarding_status: "pending_review", agreement_signed_at: "2026-11-06T10:00:00Z" } as never);
    renderOnboarding();
    expect(await screen.findByRole("heading", { name: "Application under review" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Review/ })).toBeTruthy();
  });
});

describe("agreement", () => {
  const renderSigner = (a: Agreement, sign = vi.fn()) => {
    const load = vi.fn().mockResolvedValue(a);
    render(<AgreementSigner seller={seller} load={load} sign={sign} onSigned={vi.fn()} />);
    return { load, sign };
  };

  it("renders the backend's title, text, version and date, untouched", async () => {
    renderSigner(agreement());
    expect(await screen.findByRole("heading", { name: "NOTMADE Seller Agreement — UAE" })).toBeTruthy();
    expect(document.querySelector(".agreement-doc-box")!.innerHTML).toBe(agreement().html);
    const meta = screen.getByText(/Version uae-local-v3/).textContent!;
    expect(meta).toContain("Rate card AE-2026-11-v2");
    expect(meta).toMatch(/\d{1,2} \w{3} \d{4}/);
    expect(screen.getByRole("button", { name: "Download" })).toBeTruthy();
  });

  it("shows a signed seller their stored record, with no way to sign again", async () => {
    renderSigner(agreement({ signed: true, signed_at: "2026-11-06T10:00:00Z", commission_terms: undefined }));
    expect(await screen.findByText(/Version uae-local-v3 · signed/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download" })).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /signing code/ })).toBeNull();
  });

  it("summarises several rates from the terms, never as a null rate", () => {
    const pills = agreementPills(agreement());
    expect(pills).toEqual(["Phones and laptops 12%", "Handmade 14%", "All other categories 17%", "Phones and laptops: I ship", "Seller-controlled pricing"]);
    expect(pills.join()).not.toContain("null");
  });

  it("leaves phones and laptops out for a seller who does not sell them, as they never chose who ships", () => {
    const pills = agreementPills(agreement({ commission_terms: { ...agreement().commission_terms!, default_fulfilment_mode: "notmade_ships", phones_laptops: 13.5 } }), true);
    expect(pills).toEqual(["Handmade 14%", "All other categories 17%", "Seller-controlled pricing"]);
  });

  it("handles every other shape of the terms", () => {
    expect(agreementPills({ commission_rate: 17, commission_terms: null })[0]).toBe("Commission 17%");
    expect(agreementPills({ commission_rate: null, commission_terms: { basis: "rate_card", version: "IN-2026-11-v2", effective_from: null, pct: null, handmade: 15, default: 17 } })).toEqual(["Handmade 15%", "All other categories 17%", "Seller-controlled pricing"]);
    expect(agreementPills({ commission_rate: 20, commission_terms: { basis: "override", version: null, effective_from: null, pct: 20 } })[0]).toBe("Commission 20%");
    expect(agreementPills({})).toEqual(["Seller-controlled pricing"]);
  });

  it("reloads the new text and clears the tick when it changed before signing", async () => {
    const sign = vi.fn().mockRejectedValue(new ApiError(409, "Agreement text has changed. Please reload and review it again.", { agreement_hash: "b".repeat(64) }));
    vi.spyOn(api, "sendOtp").mockResolvedValue({} as never);
    const { load } = renderSigner(agreement(), sign);
    const tick = (await screen.findByRole("checkbox")) as HTMLInputElement;
    fireEvent.click(tick);
    fireEvent.click(screen.getByRole("button", { name: /Send signing code/ }));
    fireEvent.change(await screen.findByLabelText("Email code"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign agreement" }));
    expect(await screen.findByText(/Agreement text has changed/)).toBeTruthy();
    expect(sign).toHaveBeenCalledWith({ code: "123456", signer_name: "Test Person", agreement_hash: "a".repeat(64) });
    expect(load).toHaveBeenCalledTimes(2);
    expect(((await screen.findByRole("checkbox")) as HTMLInputElement).checked).toBe(false);
  });
});

describe("bank details", () => {
  const empty = { country: "IN" as const, complete: false, bank: { account_holder_name: null, bank_name: null, account_number: null, ifsc: null } };
  const input = { account_holder_name: "", bank_name: "", account_number: "", ifsc: "", iban: "" };

  it("checks what PUT /seller/bank-details checks", () => {
    expect(validateBank("IN", { ...input, account_holder_name: "Loom", account_number: "123456789012", ifsc: "hdfc0001234" })).toEqual({});
    expect(Object.keys(validateBank("IN", { ...input, account_number: "12", ifsc: "HDFC1234" })).sort()).toEqual(["account_holder_name", "account_number", "ifsc"]);
    expect(validateBank("AE", { ...input, iban: "AE070331234567890123456" })).toEqual({});
    expect(validateBank("AE", { ...input, iban: "AE070331234567890123457" }).iban).toBeTruthy();
  });

  it("saves an India seller's account, then shows only the masked answer", async () => {
    vi.spyOn(api, "bankDetails").mockResolvedValue(empty);
    const save = vi.spyOn(api, "saveBankDetails").mockResolvedValue({ country: "IN", complete: true, bank: { account_holder_name: "Loom Works", bank_name: null, account_number: "•••• 9012", ifsc: "HDFC0001234" } });
    render(<BankDetailsCard country="IN" />);
    fireEvent.click(await screen.findByRole("button", { name: "Add bank details" }));
    type("bank-account", "123456789012"); type("bank-ifsc", "hdfc0001234"); type("bank-holder", "Loom Works");
    fireEvent.click(screen.getByRole("button", { name: "Save bank details" }));
    expect(await screen.findByText("•••• 9012")).toBeTruthy();
    expect(save).toHaveBeenCalledWith({ account_holder_name: "Loom Works", bank_name: undefined, account_number: "123456789012", ifsc: "HDFC0001234" });
    expect(document.body.textContent).not.toContain("123456789012");
  });

  it("sends a UAE seller's IBAN and no India field", async () => {
    vi.spyOn(api, "bankDetails").mockResolvedValue({ country: "AE", complete: false, bank: { account_holder_name: null, bank_name: null, iban: null } });
    const save = vi.spyOn(api, "saveBankDetails").mockResolvedValue({ country: "AE", complete: true, bank: { account_holder_name: null, bank_name: null, iban: "AE07 •••• •••• 3456" } });
    render(<BankDetailsCard country="AE" />);
    fireEvent.click(await screen.findByRole("button", { name: "Add bank details" }));
    type("bank-iban", "ae07 0331 2345 6789 0123 456");
    fireEvent.click(screen.getByRole("button", { name: "Save bank details" }));
    await screen.findByText("AE07 •••• •••• 3456");
    expect(save.mock.calls[0][0]).toEqual({ iban: "AE070331234567890123456", account_holder_name: undefined, bank_name: undefined });
    expect(document.getElementById("bank-account")).toBeNull();
  });

  it("keeps the form and the seller's typing when the save fails", async () => {
    vi.spyOn(api, "bankDetails").mockResolvedValue(empty);
    vi.spyOn(api, "saveBankDetails").mockRejectedValue(new ApiError(400, "ifsc must be a valid IFSC", {}));
    render(<BankDetailsCard country="IN" />);
    fireEvent.click(await screen.findByRole("button", { name: "Add bank details" }));
    type("bank-account", "123456789012"); type("bank-ifsc", "HDFC0001234"); type("bank-holder", "Loom Works");
    fireEvent.click(screen.getByRole("button", { name: "Save bank details" }));
    expect(await screen.findByText("ifsc must be a valid IFSC")).toBeTruthy();
    expect((document.getElementById("bank-account") as HTMLInputElement).value).toBe("123456789012");
  });

  it("names what is missing in the seller's own country", () => {
    render(<PayoutBlockedNotice country="IN" />);
    expect(screen.getByText("Add bank details to receive payouts.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Add bank details" }).getAttribute("href")).toBe("/dashboard/profile#bank");
    expect(document.body.textContent).not.toContain("IBAN");
  });
});

describe("/uae", () => {
  const page = (signupOpen: boolean) => renderToStaticMarkup(<UaeLanding payments={null} signupOpen={signupOpen} />);

  it("has the real sign-up button and no waitlist once AE is listed", () => {
    const html = page(true);
    expect(html).toContain('href="/login?market=ae&amp;apply=1"');
    expect(html).toContain("Register to sell");
    expect(html).not.toContain("Registrations opening soon");
    expect(html).not.toContain("Notify me");
  });

  it("keeps the waitlist only while AE is not listed", () => {
    const html = page(false);
    expect(html).toContain("Notify me");
    expect(html).not.toContain("apply=1");
  });
});
