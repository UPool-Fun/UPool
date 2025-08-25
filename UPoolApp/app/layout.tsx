import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

const frameMetadata = {
  version: "next",
  imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || "https://upool.fun/logo-seo.png",
  aspectRatio: "3:2",
  button: {
    title: "UPool",
    action: {
      type: "launch_frame",
      name: "UPool",
      url: process.env.NEXT_PUBLIC_URL || "https://upool.fun",
      splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || "https://upool.fun/splash.png",
      splashBackgroundColor: "#2998d0"
    }
  }
}

export const metadata: Metadata = {
  title: {
    default: 'UPool - Social Funding Platform | Pool Funds, Earn Yield, Achieve Goals',
    template: '%s | UPool - Social Funding Platform'
  },
  description: 'Create funding pools with friends and communities on Base blockchain. Pool funds together, earn DeFi yield through Morpho Protocol, and unlock money based on milestone achievements. Built as a native Farcaster Mini App.',
  keywords: [
    'social funding',
    'cryptocurrency pool',
    'DeFi yield farming',
    'Base blockchain',
    'Farcaster Mini App',
    'community funding',
    'milestone-based funding',
    'crypto savings',
    'blockchain crowdfunding',
    'Web3 social',
    'Morpho Protocol',
    'group savings',
    'collaborative finance',
    'decentralized funding',
    'crypto community'
  ],
  authors: [{ name: 'UPool Team', url: 'https://upool.fun' }],
  creator: 'UPool Team',
  publisher: 'UPool',
  generator: 'UPool.fun',
  applicationName: 'UPool',
  referrer: 'origin-when-cross-origin',
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
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_URL || 'https://upool.fun',
    siteName: 'UPool',
    title: 'UPool - Social Funding Platform | Pool Funds, Earn Yield, Achieve Goals',
    description: 'Create funding pools with friends and communities. Pool funds, earn DeFi yield, and unlock money based on milestone achievements. Native Farcaster Mini App on Base blockchain.',
    images: [
      {
        url: process.env.NEXT_PUBLIC_IMAGE_URL || 'https://upool.fun/logo-seo.png',
        width: 1200,
        height: 630,
        alt: 'UPool - Social Funding Platform',
      },
      {
        url: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || 'https://upool.fun/splash.png',
        width: 800,
        height: 600,
        alt: 'UPool Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPool - Social Funding Platform | Pool Funds, Earn Yield',
    description: 'Create funding pools with friends and communities. Pool funds, earn DeFi yield, and unlock money based on milestone achievements.',
    site: '@UPoolFun',
    creator: '@UPoolFun',
    images: [process.env.NEXT_PUBLIC_IMAGE_URL || 'https://upool.fun/logo-seo.png'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  category: 'Finance',
  classification: 'Decentralized Finance, Social Finance, Blockchain Application',
  other: {
    'fc:frame': JSON.stringify(frameMetadata),
    'theme-color': '#2998d0',
    'color-scheme': 'light',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
