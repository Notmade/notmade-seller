import type { Metadata } from "next";
import UaeLanding from "../components/landing/UaeLanding";
import uae from "../landing/content/ae";
import { loadUaePaymentMethods, loadUaeRateCard } from "../lib/landing-data";
import { pageMetadata } from "../lib/seo";

// Reads SELLER_SIGNUP_COUNTRIES and live rates at request time
export const dynamic = "force-dynamic";

export const uaeMetadata: Metadata = pageMetadata({ ...uae.meta, path: "/uae", locale: "en_AE" });
export const metadata = uaeMetadata;

/** Same variable and default as the backend: business countries open for new seller sign-ups. */
function signupCountries(): string[] {
  return (process.env.SELLER_SIGNUP_COUNTRIES || "IN").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
}

export default async function UaePage() {
  const [rates, methods] = await Promise.all([loadUaeRateCard(), loadUaePaymentMethods()]);
  return <UaeLanding rates={rates} methods={methods} signupOpen={signupCountries().includes("AE")} />;
}
