import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import { icons } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QA Univalle",
  description:
    "Sistema inteligente de pregunta-respuesta sobre procesos académicos, administrativos, de bienestar, internacionalización e investigación.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QA Univalle",
  },
  icons: {
    apple: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex w-full h-full overflow-hidden">
            <AnimatedBackground />
            <div className="flex flex-1 overflow-y-auto">{children}</div>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
