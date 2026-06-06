import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import { config } from "@/lib/config";
import { makeSessionToken } from "@/lib/session";
import AuthScreen from "@/components/AuthScreen";
import CommandPalette from "@/components/CommandPalette";
import { AppProvider } from "@/components/AppProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Krysalis OS — Mission Control",
  description: "Krysalis OS's command center for Claude, OpenClaw, Hermes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a111a",
};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("krysalis_auth")?.value;
  const requiresAuth = !!config.pinCode;
  const isAuthenticated = !requiresAuth || (!!config.pinCode && authCookie === makeSessionToken(config.pinCode));
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/*
          Midnight Aubergine design system — three voices:
          Bricolage Grotesque (display) · Manrope (body) · Caveat (hand-script
          numerals/emphasis) · JetBrains Mono (code).
        */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Caveat:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-full">
        <AppProvider>
          <div className="relative z-10">
            {!isAuthenticated ? <AuthScreen /> : (
              <>
                <CommandPalette />
                <Shell>{children}</Shell>
              </>
            )}
          </div>
          <Toaster theme="dark" position="bottom-right" toastOptions={{
            style: {
              background: 'var(--bg-elev)',
              border: '1px solid var(--panel-border-hot)',
              color: 'var(--cream)',
              fontFamily: 'Manrope, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              borderRadius: '12px'
            }
          }} />
        </AppProvider>
      </body>
    </html>
  );
}
