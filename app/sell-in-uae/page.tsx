import CountryPage from "../components/public/CountryPage";
import { metadataFor } from "../lib/seo";
import { signupCountries } from "../lib/signup";

// Reads SELLER_SIGNUP_COUNTRIES at request time, so opening UAE sign-up needs no rebuild
export const dynamic = "force-dynamic";

export const metadata = metadataFor("sell-in-uae");

export default function SellInUae() {
  return <CountryPage code="ae" signupOpen={signupCountries().includes("AE")} />;
}
