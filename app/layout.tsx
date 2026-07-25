import type { Metadata } from "next";
import { Bebas_Neue, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sell on NOTMADE — Apply for Seller Programme",
  description:
    "List your streetwear brand on NOTMADE marketplace. 12% commission, same-day Delhi NCR delivery, zero setup fees.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sell on NOTMADE",
    description: "12% commission. ₹0 fees. Same day Delhi NCR delivery.",
    url: "https://seller.notmade.in",
    siteName: "NOTMADE Seller Portal",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="antialiased bg-white text-[#111111]">{children}</body>
    </html>
  );
}
