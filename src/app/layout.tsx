import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "水野真紀の魔法のレストラン 紹介店検索";
const SITE_DESCRIPTION = "MBS「水野真紀の魔法のレストラン」で紹介されたお店を都道府県・市区町村・ジャンル・現在地から検索できる非公式サイト。2016年から現在まで2700件超のお店を収録。";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://magic-restaurant-search.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
const VALUECOMMERCE_PID = process.env.NEXT_PUBLIC_VALUECOMMERCE_PID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {VALUECOMMERCE_PID && (
          <>
            <Script id="vc-pid" strategy="afterInteractive">
              {`var vc_pid = "${VALUECOMMERCE_PID}";`}
            </Script>
            <Script
              src="https://aml.valuecommerce.com/vcdal.js"
              strategy="afterInteractive"
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
