import CountryPage from "../components/public/CountryPage";
import { metadataFor } from "../lib/seo";

export const metadata = metadataFor("sell-in-india");

export default function SellInIndia() {
  return <CountryPage code="in" />;
}
