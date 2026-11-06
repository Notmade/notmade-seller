// The neutral country switcher, and the only place a landing page names the other country. Plain links:
// each country is its own page, so the page you are on never carries the other one's content.
import type { ModeCode } from "@/app/landing/content/types";
import { FLAG_AE, FLAG_IN } from "@/src/config/flags";

// /?market=in beats a remembered UAE choice; the page's canonical stays /
const COUNTRIES = [
  { code: "in", name: "India", href: "/?market=in", flag: FLAG_IN },
  { code: "ae", name: "UAE", href: "/uae", flag: FLAG_AE },
] as const;

export default function CountrySwitch({ value }: { value: ModeCode }) {
  return (
    <nav className="n-switch" aria-label="Country" data-country-switch>
      {COUNTRIES.map((c) => {
        const flag = <svg viewBox="0 0 30 20" width="22" height="15" aria-hidden dangerouslySetInnerHTML={{ __html: c.flag }} />;
        return c.code === value
          ? <span key={c.code} aria-current="true">{flag}{c.name}</span>
          : <a key={c.code} href={c.href} data-flip-link>{flag}{c.name}</a>;
      })}
    </nav>
  );
}
