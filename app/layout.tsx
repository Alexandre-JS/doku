import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import CookieBanner from "../components/CookieBanner";
import NewsletterModal from "../components/NewsletterModal";
import RealtimePresenceTracker from "../src/hooks/useRealtimePresence";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://documoz.com"),
  // O título deve ter a palavra-chave e o benefício principal
  title: {
    default: "Dokumoz | Minutas, Declarações e Documentos Oficiais em Moçambique",
    template: "%s | Dokumoz"
  },
  
  description: 
    "Crie o seu currículo, carta de emprego, declarações de residência e requerimentos oficiais em 2 minutos. Simples, seguro e pronto para imprimir.",
  
  // Palavras-chave que os jovens moçambicanos pesquisam no Google
  keywords: [
    "minutas Moçambique", 
    "currículo profissional", 
    "carta de candidatura emprego", 
    "declaração de residência", 
    "requerimento DUAT", 
    "contrato de arrendamento simples",
  
    // Marca e Core
  "Dokumoz", "DOKU", "minutas Moçambique", "documentos oficiais online", 
  "gerador de documentos pdf", "formulários moçambicanos",
  
  // Emprego (O "João")
  "currículo profissional", "carta de candidatura emprego", "carta de pedido de estágio", 
  "modelo de CV simples", "requerimento de emprego",
  
  // Habitação e Terra
  "contrato de arrendamento simples", "requerimento DUAT", "compra e venda de terrenos", 
  "declaração de residência", "contrato de subarrendamento",
  
  // Educação
  "pedido de certificado de habilitações", "requerimento escolar", "vaga de matrícula",
  
  // Termos de Busca Locais (O que as pessoas digitam)
  "minutas prontas para imprimir", "como fazer carta de pedido de emprego", 
  "modelos de documentos em Moçambique", "escritório digital Moçambique",
  "agilizar documentos no município", "minutas grátis Moçambique"
  ],

  authors: [{ name: "DOKU", url: "https://documoz.com" }],
  
  // Configurações para redes sociais (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    title: "DOKU - Documentos Oficiais em 2 Minutos",
    description: "Resolva a sua burocracia agora. De cartas de emprego a requerimentos oficiais, o DOKU ajuda-o a avançar.",
    url: "https://documoz.com",
    siteName: "DOKUMOZ Moçambique",
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

  twitter: {
    card: "summary_large_image",
    title: "DOKU - Documentos Oficiais em 2 Minutos",
    description: "Resolva a sua burocracia agora. De cartas de emprego a requerimentos oficiais, o DOKU ajuda-o a avançar.",
    images: ["/og-image.png"],
  },

  // Configuração de Ícones
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  
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
  // JSON-LD para SoftwareApplication
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Dokumoz",
    "operatingSystem": "Any",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "MZN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  return (
    <html lang="pt-MZ">
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <RealtimePresenceTracker />
        <CookieBanner />
        <NewsletterModal />
      </body>
    </html>
  );
}
