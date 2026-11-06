// @vitest-environment jsdom
// With AE missing from SELLER_SIGNUP_COUNTRIES, no screen may start a new UAE seller account.
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignupCountriesProvider } from "@/app/components/market";
import { api, ApiError, type Seller } from "@/app/lib/seller-api";
import { signupCountries } from "@/app/lib/signup-countries";
import LoginPage from "@/app/login/page";
import OnboardingPage from "@/app/onboarding/page";

const nav = vi.hoisted(() => ({ query: "", seller: null as unknown }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(nav.query),
}));
vi.mock("@/app/lib/useSeller", () => ({
  useSeller: () => ({ state: { status: "ready", seller: nav.seller }, reload: vi.fn(), signOut: vi.fn() }),
}));

const closed = ["IN"];
const open = ["IN", "AE"];

function renderLogin(countries: string[], query: string) {
  nav.query = query;
  return render(<SignupCountriesProvider countries={countries}><LoginPage /></SignupCountriesProvider>);
}

function renderOnboarding(countries: string[]) {
  nav.query = "market=ae";
  return render(<SignupCountriesProvider countries={countries}><OnboardingPage /></SignupCountriesProvider>);
}

const pickUae = () => fireEvent.click(screen.getByRole("button", { name: /UAE/ }));

const submitEmail = () => {
  fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "new@brand.ae" } });
  fireEvent.click(screen.getByRole("button", { name: "Send code" }));
};

beforeEach(() => {
  nav.seller = null;
  document.cookie = "nm_market=; path=/; max-age=0";
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("SELLER_SIGNUP_COUNTRIES", () => {
  it("defaults to India and reads AE only when listed", () => {
    expect(signupCountries(undefined)).toEqual(["IN"]);
    expect(signupCountries("")).toEqual(["IN"]);
    expect(signupCountries("IN")).not.toContain("AE");
    expect(signupCountries(" in , ae ")).toEqual(["IN", "AE"]);
  });
});

describe("login", () => {
  it("shows no email form on the UAE apply link while closed", () => {
    const send = vi.spyOn(api, "sendOtp");
    renderLogin(closed, "market=ae&apply=1");
    expect(screen.getByRole("heading", { name: "Registrations opening soon" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Leave your email" }).getAttribute("href")).toBe("/uae#start");
    expect(screen.getByRole("link", { name: "care@notmade.in" })).toBeTruthy();
    expect(screen.queryByLabelText("Work email")).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });

  it("never asks for a signup code for an unknown UAE email while closed", async () => {
    const send = vi.spyOn(api, "sendOtp").mockRejectedValue(new ApiError(404, "Not found", {}));
    renderLogin(closed, "market=ae");
    submitEmail();
    expect((await screen.findByRole("alert")).textContent).toContain("Registrations are opening soon");
    expect(send.mock.calls).toEqual([["new@brand.ae", "login"]]);
  });

  it("still logs in an existing UAE seller while closed", async () => {
    const send = vi.spyOn(api, "sendOtp").mockResolvedValue({} as never);
    renderLogin(closed, "market=ae");
    submitEmail();
    await waitFor(() => expect(screen.getByRole("group", { name: "6-digit code" })).toBeTruthy());
    expect(send.mock.calls).toEqual([["new@brand.ae", "login"]]);
  });

  it("lets an unknown email sign up once AE is listed, and in India while AE is closed", async () => {
    const send = vi.spyOn(api, "sendOtp").mockImplementation(async (_e, purpose) => {
      if (purpose === "login") throw new ApiError(404, "Not found", {});
      return {} as never;
    });
    renderLogin(open, "market=ae&apply=1");
    submitEmail();
    await waitFor(() => expect(send).toHaveBeenCalledWith("new@brand.ae", "signup"));
    cleanup();
    send.mockClear();
    renderLogin(closed, "market=in&apply=1");
    submitEmail();
    await waitFor(() => expect(send).toHaveBeenCalledWith("new@brand.ae", "signup"));
  });
});

describe("onboarding", () => {
  it("offers a new seller only the waitlist for the UAE while closed", () => {
    const signup = vi.spyOn(api, "signup");
    renderOnboarding(closed);
    expect(screen.getByRole("button", { name: /UAE/ }).textContent).toContain("Registrations opening soon");
    pickUae();
    expect(screen.getByText("Seller registration is not open here yet.")).toBeTruthy();
    expect(document.getElementById("trade_licence_number")).toBeNull();
    expect(screen.queryByRole("button", { name: /save|continue/i })).toBeNull();
    expect(signup).not.toHaveBeenCalled();
  });

  it("shows the UAE form to a new seller once AE is listed", () => {
    renderOnboarding(open);
    pickUae();
    expect(document.getElementById("trade_licence_number")).toBeTruthy();
  });

  it("does not stop a UAE seller who already has an account", async () => {
    nav.seller = { seller_country: "AE", onboarding_status: "pending_details" } as Seller;
    vi.spyOn(api, "onboardingStatus").mockResolvedValue({ next_step: "details" } as never);
    renderOnboarding(closed);
    await waitFor(() => expect(document.getElementById("trade_licence_number")).toBeTruthy());
  });
});
