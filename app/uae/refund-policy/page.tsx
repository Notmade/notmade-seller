import type { Metadata } from "next";
import { redirect } from "next/navigation";
import UaeLegalPage from "../../components/legal/UaeLegalPage";
import { legalCountry } from "../../legal/country";
import { UAE_REFUNDS } from "../../legal/uae";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({ title: UAE_REFUNDS.metaTitle, description: UAE_REFUNDS.description, path: "/uae/refund-policy", locale: "en_AE" });

export default function Page() {
  // This URL is UAE by definition; only a signed-in seller from elsewhere is sent to their own page
  if (legalCountry("ae") === "IN") redirect("/refund-policy");
  return <UaeLegalPage doc={UAE_REFUNDS} path="/uae/refund-policy" />;
}
