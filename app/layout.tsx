import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { safeAuth } from "@/lib/server/safe-auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Audiobooks & serialized fiction`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_TAGLINE,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await safeAuth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-dvh overflow-x-hidden antialiased`}
    >
      <body className="flex min-h-dvh flex-col overflow-x-hidden bg-surface font-sans text-text-primary">
        <Providers session={session}>
          <SiteHeader />
          <main className="scroll-touch flex min-h-0 flex-1 flex-col">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
