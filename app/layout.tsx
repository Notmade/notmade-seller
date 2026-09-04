import type { Metadata } from "next";
import { Bebas_Neue, Archivo, Space_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sell on NOTMADE — Built For Sellers Who Mean Business",
  description:
    "Not another marketplace. A platform that actually gives a damn about your cash flow, your customers, and your growth. Apply to sell on NOTMADE.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sell on NOTMADE — Built For Sellers Who Mean Business",
    description: "7-day payouts. Better commissions. No BS. Apply to sell.",
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
    <html
      lang="en"
      className={`${bebasNeue.variable} ${archivo.variable} ${spaceMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
