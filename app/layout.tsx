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
  // O título deve ter a palavra-chave e o benefício principal
  title: "DOKUMOZ | Minutas, Declarações e Documentos Oficiais em Moçambique",
  
  description: 
    "Gere o seu currículo, carta de emprego, declarações de residência e requerimentos oficiais em 2 minutos. Simples, seguro e pronto para imprimir.",
  
  // Palavras-chave que os jovens moçambicanos pesquisam no Google
  keywords: [
    "minutas Moçambique", 
    "currículo profissional", 
    "carta de candidatura emprego", 
    "declaração de residência", 
    "requerimento DUAT", 
    "documentos oficiais online",
    "Documoz",
    "DOKU"
  ],

  authors: [{ name: "DOKU", url: "https://documoz.com" }],
  
  // Configurações para redes sociais (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    title: "DOKU - Documentos Oficiais em 2 Minutos",
    description: "Resolva a sua burocracia agora. De cartas de emprego a requerimentos oficiais, o DOKU ajuda-o a avançar.",
    url: "https://documoz.com",
    siteName: "DOKU Moçambique",
    locale: "pt_MZ",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Imagem que aparece na partilha (crie uma imagem de 1200x630)
        width: 1200,
        height: 630,
        alt: "DOKU - Plataforma de Documentos em Moçambique",
      },
    ],
  },

  // Configuração de Ícones
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },

  // Garante que o site seja visto corretamente em telemóveis
  viewport: "width=device-width, initial-scale=1",
  
  // Impede que o Google traduza o nome da marca
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
