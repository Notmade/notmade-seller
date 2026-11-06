import type { Metadata } from "next";
import UaeLanding from "../components/landing/UaeLanding";
import uae from "../landing/content/ae";
import { loadUaePaymentMethods, loadUaeRateCard } from "../lib/landing-data";
import { pageMetadata } from "../lib/seo";
import { signupCountries } from "../lib/signup-countries";

// Reads SELLER_SIGNUP_COUNTRIES and live rates at request time
export const dynamic = "force-dynamic";

export const uaeMetadata: Metadata = pageMetadata({ ...uae.meta, path: "/uae", locale: "en_AE" });
export const metadata = uaeMetadata;

export default async function UaePage() {
  const [rates, methods] = await Promise.all([loadUaeRateCard(), loadUaePaymentMethods()]);
  return <UaeLanding rates={rates} methods={methods} signupOpen={signupCountries().includes("AE")} />;
}
