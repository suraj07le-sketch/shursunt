import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Outfit, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import "crypto-icons/font.css";
import "crypto-icons/styles.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import NextTopLoader from 'nextjs-toploader';
import { GlobalErrorSuppressor } from "@/components/ui/GlobalErrorSuppressor";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import JsonLd from '@/components/seo/JsonLd';

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const viewport: Viewport = {
    themeColor: "#09090b",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export const metadata: Metadata = {
    title: {
        template: '%s | ShursunT AI',
        default: 'ShursunT AI - Institutional Stock & Crypto Intelligence',
    },
    description: "Algorithmic market intelligence platform providing AI-powered price predictions, confluence setups, and real-time execution analytics across 500+ Indian equities and 1000+ crypto pairs.",
    keywords: ["Indian Stocks", "Crypto Predictions", "NSE", "BSE", "AI Trading", "Market Screener", "ShursunT"],
    authors: [{ name: "ShursunT AI" }],
    creator: "ShursunT AI",
    publisher: "ShursunT AI",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            className={`${spaceGrotesk.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
        >
            <body
                suppressHydrationWarning
                className="font-sans antialiased min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-clip"
            >
                <JsonLd />
                <GlobalErrorSuppressor />
                <ServiceWorkerRegistration />
                <NextTopLoader
                    color="#f59e0b"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={2}
                    crawl={true}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px #f59e0b,0 0 5px #f59e0b"
                />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <NextIntlClientProvider messages={messages}>
                        <QueryProvider>
                            <AuthProvider>
                                {children}
                                <Toaster
                                    richColors
                                    closeButton
                                    position="bottom-right"
                                    theme="dark"
                                />
                            </AuthProvider>
                        </QueryProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
