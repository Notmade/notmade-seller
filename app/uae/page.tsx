import type { Metadata } from "next";
import UaeLanding from "../components/landing/UaeLanding";
import uae from "../landing/content/ae";
import { loadPublicRates, loadUaePaymentConfig, withLiveStandardRate, withLiveWhoShipsRates } from "../lib/landing-data";
import { pageMetadata } from "../lib/seo";
import { signupCountries } from "../lib/signup-countries";

// Reads SELLER_SIGNUP_COUNTRIES, live rates and live payment methods at request time
export const dynamic = "force-dynamic";

export const uaeMetadata: Metadata = pageMetadata({ ...uae.meta, path: "/uae", locale: "en_AE" });
export const metadata = uaeMetadata;

export default async function UaePage() {
  const [live, payments] = await Promise.all([loadPublicRates(), loadUaePaymentConfig()]);
  const rates = withLiveWhoShipsRates(withLiveStandardRate(uae.rates, live?.uae_local_pct), live?.uae_rate_card);
  return <UaeLanding rates={rates} payments={payments} signupOpen={signupCountries().includes("AE")} />;
}
