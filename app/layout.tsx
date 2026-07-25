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
  title: "Sell on NOTMADE — Apply Now",
  description:
    "Join NOTMADE's curated street-culture marketplace. Apply to become a seller and get your brand in front of the culture.",
  openGraph: {
    title: "Sell on NOTMADE — Apply Now",
    description:
      "Join NOTMADE's curated street-culture marketplace. Apply to become a seller.",
    siteName: "NOTMADE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="antialiased bg-[#080808] text-white">{children}</body>
    </html>
  );
}
