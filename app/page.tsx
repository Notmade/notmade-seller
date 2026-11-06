import type { Metadata } from "next";
import { cookies } from "next/headers";
import IndiaLanding from "./components/landing/IndiaLanding";
import india from "./landing/content/in";
import { MARKET_COOKIE, selectMode } from "./landing/content";
import { loadPublicRates, withLiveStandardRate } from "./lib/landing-data";
import { pageMetadata } from "./lib/seo";
import UaePage, { uaeMetadata } from "./uae/page";

// The country decides the whole page
export const dynamic = "force-dynamic";

type Search = { [key: string]: string | string[] | undefined };

const modeFor = (s: Search) => selectMode(s.market, cookies().get(MARKET_COOKIE)?.value);

export function generateMetadata({ searchParams }: { searchParams: Search }): Metadata {
  return modeFor(searchParams) === "ae" ? uaeMetadata : pageMetadata({ ...india.meta, path: "/", locale: "en_IN" });
}

export default async function Home({ searchParams }: { searchParams: Search }) {
  if (modeFor(searchParams) === "ae") return <UaePage />;
  const live = await loadPublicRates();
  return <IndiaLanding rates={withLiveStandardRate(india.rates, live?.india_pct)} />;
}
