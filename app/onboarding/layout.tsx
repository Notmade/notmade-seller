import { SignupCountriesProvider } from "../components/market";
import { NOINDEX } from "../lib/seo";
import { signupCountries } from "../lib/signup-countries";

// Reads SELLER_SIGNUP_COUNTRIES at request time
export const dynamic = "force-dynamic";

export const metadata = { ...NOINDEX, title: "NOTMADE Seller" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SignupCountriesProvider countries={signupCountries()}>{children}</SignupCountriesProvider>;
}
