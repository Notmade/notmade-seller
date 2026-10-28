import type { Metadata } from "next";
import Landing from "./components/landing/Landing";
import JsonLd from "./components/public/JsonLd";
import { faqLd, metadataFor, organizationLd, websiteLd } from "./lib/seo";
import { signupCountries } from "./lib/signup";
import { getMode } from "./landing/content";

// Reads SELLER_SIGNUP_COUNTRIES at request time, so opening UAE sign-up needs no rebuild
export const dynamic = "force-dynamic";

type Search = { [key: string]: string | string[] | undefined };

const fromQuery = (s: Search) => (typeof s.market === "string" ? s.market : undefined);

// /?market=ae is the UAE view of the landing; /sell-in-uae is the page search engines should index for it
export function generateMetadata({ searchParams }: { searchParams: Search }): Metadata {
  return metadataFor(getMode(fromQuery(searchParams)).code === "ae" ? "sell-in-uae" : "home");
}

export default function Home({ searchParams }: { searchParams: Search }) {
  // ?market= picks the mode; India by default
  const mode = getMode(fromQuery(searchParams));

  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd(), faqLd(mode.faq)]} />
      <Landing initial={mode.code} uaeSignupOpen={signupCountries().includes("AE")} />
    </>
  );
}
