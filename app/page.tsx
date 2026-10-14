import type { Metadata } from "next";
import { cookies } from "next/headers";
import Landing from "./components/Landing";
import { faqLd, organizationLd, pageMetadata } from "./lib/seo";
import { DEFAULT_MARKET, MARKET_COOKIE, landingMarket } from "@/src/config/markets";

type Search = { [key: string]: string | string[] | undefined };

const fromQuery = (s: Search) => (typeof s.market === "string" ? s.market : undefined);

export function generateMetadata({ searchParams }: { searchParams: Search }): Metadata {
  const market = landingMarket(fromQuery(searchParams));
  return pageMetadata({
    ...market.landing.meta,
    path: market.code === DEFAULT_MARKET ? "/" : `/?market=${market.code}`,
  });
}

export default function Home({ searchParams }: { searchParams: Search }) {
  // ?market= wins (shared links), then the cookie, then India
  const market = landingMarket(fromQuery(searchParams) ?? cookies().get(MARKET_COOKIE)?.value);

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationLd(), faqLd(market.landing.faq)]) }} />
      <Landing initial={market.code} />
    </>
  );
}
