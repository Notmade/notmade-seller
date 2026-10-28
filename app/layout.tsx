import type { Metadata } from "next";
import { Bebas_Neue, Archivo, Inter, Space_Mono } from "next/font/google";
import { SITE_URL } from "./lib/seller-config";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

// Archivo and Space Mono are only used in the portal, so public pages do not preload them (LCP)
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  preload: false,
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
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sell on NOTMADE | Seller portal",
  description: "Open a NOTMADE seller account. Sell on notmade.in and get paid within 7 days after each order is delivered.",
  robots: { index: true, follow: true },
  openGraph: { siteName: "NOTMADE Seller", url: SITE_URL },
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
      className={`${bebasNeue.variable} ${archivo.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
