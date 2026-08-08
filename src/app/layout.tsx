import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/toaster";
import "./globals.css";

// Cascadia Mono (SIL OFL, Microsoft) — the whole site renders in it
const cascadiaMono = localFont({
  src: "./fonts/CascadiaMono.woff2",
  weight: "200 700",
  variable: "--font-sans",
  display: "swap"
});

const cascadiaMonoMono = localFont({
  src: "./fonts/CascadiaMono.woff2",
  weight: "200 700",
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL ?? "http://localhost:3000"),
  title: {
    default: "OpenJar — Open support for open creators",
    template: "%s · OpenJar"
  },
  description:
    "Support developers, artists, musicians, writers, and creators building amazing things. Free & open-source funding for open creators.",
  openGraph: {
    title: "OpenJar",
    description: "Open support for open creators.",
    type: "website",
    siteName: "OpenJar"
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenJar",
    description: "Open support for open creators."
  }
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cascadiaMono.variable} ${cascadiaMonoMono.variable} flex min-h-screen flex-col`}>
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
