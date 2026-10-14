import { NOINDEX } from "../lib/seo";

export const metadata = { ...NOINDEX, title: "NOTMADE Seller" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
