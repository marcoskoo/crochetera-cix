import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CROCHETERA.CIX — Peluches tejidos a mano con amor",
  description:
    "Tienda de peluches tejidos a crochet hechos a mano. Ositos, conejitos, personajes y amigurumis personalizados. Cada pieza única, tejida con amor.",
  keywords: [
    "crochet",
    "peluches",
    "amigurumi",
    "tejido a mano",
    "peluches personalizados",
    "artesanía",
    "hecho a mano",
    "CROCHETERA.CIX",
  ],
  authors: [{ name: "CROCHETERA.CIX" }],
  openGraph: {
    title: "CROCHETERA.CIX — Peluches tejidos a mano con amor",
    description:
      "Tienda de peluches tejidos a crochet hechos a mano. Ositos, conejitos, personajes y amigurumis personalizados.",
    siteName: "CROCHETERA.CIX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CROCHETERA.CIX",
    description: "Peluches tejidos a mano con amor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
