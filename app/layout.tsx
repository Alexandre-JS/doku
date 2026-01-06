import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import CookieBanner from "../components/CookieBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DOKU - Documentos Oficiais",
  description: "Seu documento oficial pronto em 2 minutos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased`}
      >
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
