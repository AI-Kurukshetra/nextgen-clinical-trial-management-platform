import type { Metadata } from "next";
import { Geist, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Providers } from "@/components/common/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TrialFlow CTMS",
  description:
    "Clinical Trial Management System for study governance, site operations, monitoring, and compliance.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${plusJakarta.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
