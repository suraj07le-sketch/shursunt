import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import "crypto-icons/font.css"
import "crypto-icons/styles.css"
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from 'sonner'
import JsonLd from '@/components/seo/JsonLd'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://solaris-ai.com'), // Replace with actual domain when live
  title: {
    default: 'Solaris AI | Advanced Crypto Analytics & Price Predictions',
    template: '%s | Solaris AI'
  },
  description: 'Maximize your crypto trading ROI with Solaris AI. Real-time AI price predictions, sentiment analysis, and automated trading signals for Bitcoin, Ethereum, and Stocks.',
  keywords: ['AI Crypto Trading', 'Bitcoin Price Prediction', 'Crypto Analytics Platform', 'Automated Trading Bot', 'Sentiment Analysis Crypto', 'Solaris AI', 'Stock Market AI'],
  authors: [{ name: 'Solaris AI Team' }],
  creator: 'Solaris AI',
  publisher: 'Solaris AI',
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
  openGraph: {
    title: 'Solaris AI | The Future of Crypto Analytics',
    description: 'Join the next generation of traders using AI to predict market movements with 85%+ accuracy.',
    url: 'https://solaris-ai.com',
    siteName: 'Solaris AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // Needs to be created
        width: 1200,
        height: 630,
        alt: 'Solaris AI Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solaris AI | AI-Powered Crypto Predictions',
    description: 'Get real-time AI signals for your portfolio. Trade smarter, not harder.',
    creator: '@SolarisAI',
    images: ['/twitter-image.png'], // Needs to be created
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

import NextTopLoader from 'nextjs-toploader';

import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";

// ... imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextTopLoader
          color="hsl(var(--primary))"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
        />


        {/* Global Star Background Layer */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <StarsBackground
            starDensity={0.0002}
            allStarsTwinkle={true}
            minStarSize={0.5}
            maxStarSize={1.0}
            className="opacity-100"
          />
          <ShootingStars
            minDelay={3000}
            maxDelay={6000}
          />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={['light', 'dark', 'neon', 'cyber']}
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="bottom-right" theme="system" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
