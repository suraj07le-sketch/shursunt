import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import '@/app/globals.css' // Adjusted import path
import "crypto-icons/font.css"
import "crypto-icons/styles.css"
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from 'sonner'
import NextTopLoader from 'nextjs-toploader';
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { GlobalErrorSuppressor } from "@/components/ui/GlobalErrorSuppressor";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
})

export const metadata: Metadata = {
    // ... Metadata (can keep or adjust locale dynamically)
    title: {
        default: 'ShursunT AI | Advanced Crypto Analytics',
        template: '%s | ShursunT AI'
    },
    description: 'Maximize your crypto trading ROI with ShursunT AI.',
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: any;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Provide all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#09090b" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="ShursunT" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <body className={`${outfit.className} antialiased`} suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    <NextTopLoader
                        color="hsl(var(--primary))"
                        initialPosition={0.08}
                        showSpinner={false}
                        speed={200}
                        shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
                    />

                    <div className="fixed inset-0 z-[-1] pointer-events-none">
                        <StarsBackground starDensity={0.0002} allStarsTwinkle={true} minStarSize={0.5} maxStarSize={1.0} className="opacity-100" />
                        <ShootingStars minDelay={3000} maxDelay={6000} />
                    </div>



                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        themes={['light', 'dark', 'neon', 'cyber']}
                        enableSystem
                        disableTransitionOnChange
                    >
                        <GlobalErrorSuppressor />
                        <ServiceWorkerRegistration />
                        <AuthProvider>
                            {children}
                            <Toaster richColors position="bottom-right" theme="system" />
                        </AuthProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
