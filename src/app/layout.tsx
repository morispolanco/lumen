import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumen Clásico — Textos clásicos con rigor filológico y enfoque pedagógico",
  description:
    "Busca, justifica y explica pedagógicamente fragmentos auténticos de textos clásicos de la cultura occidental adaptados a Primaria, Secundaria y Diversificado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${ebGaramond.variable} ${inter.variable}`}>
      <body className="font-sans bg-parchment-50 text-ink-900 flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="no-print border-t border-parchment-200 bg-parchment-100/60 mt-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500">
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-semibold text-crimson-700">
                  Lumen Clásico
                </span>
                <span>·</span>
                <span>Humanidades y pedagogía en diálogo con los clásicos</span>
              </div>
              <p className="text-center sm:text-right">
                Citas verificadas con transparencia filológica · Pensado para el aula
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
