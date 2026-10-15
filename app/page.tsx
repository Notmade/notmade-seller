import type { Metadata } from "next";
import Landing from "./components/landing/Landing";
import { faqLd, organizationLd, pageMetadata } from "./lib/seo";
import { DEFAULT_MODE, getMode } from "./landing/content";

// Reads SELLER_SIGNUP_COUNTRIES at request time, so opening UAE sign-up needs no rebuild
export const dynamic = "force-dynamic";

type Search = { [key: string]: string | string[] | undefined };

const fromQuery = (s: Search) => (typeof s.market === "string" ? s.market : undefined);

/** Same variable and default as the backend: business countries open for new seller sign-ups. */
function signupCountries(): string[] {
  return (process.env.SELLER_SIGNUP_COUNTRIES || "IN").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
}

export function generateMetadata({ searchParams }: { searchParams: Search }): Metadata {
  const mode = getMode(fromQuery(searchParams));
  return pageMetadata({ ...mode.meta, path: mode.code === DEFAULT_MODE ? "/" : `/?market=${mode.code}` });
}

export default function Home({ searchParams }: { searchParams: Search }) {
  // ?market= picks the mode; India by default
  const mode = getMode(fromQuery(searchParams));

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationLd(), faqLd(mode.faq)]) }} />
      <Landing initial={mode.code} uaeSignupOpen={signupCountries().includes("AE")} />
    </>
  );
}
