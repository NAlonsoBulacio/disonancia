import type { Metadata } from "next";
import { Barlow_Condensed, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ciclo disonancia — Entradas",
  description:
    "Reservá tus entradas gratuitas para Ciclo disonancia. Sábado 13 de junio, 21 hs en La Gesta Cultural.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Ciclo disonancia",
    description: "Sábado 13.06 — La Gesta Cultural, Av Alem 747",
    images: ["/flyer.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${barlowCondensed.variable}`}
    >
      <body className="font-condensed antialiased">{children}</body>
    </html>
  );
}
