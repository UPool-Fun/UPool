import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { MobileDebugger } from '@/components/debug-mobile';

const inter = Inter({ subsets: ['latin'] });

const frameMetadata = {
  version: "next",
  imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || "https://upool.fun/images/logo.png",
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
  title: 'UPool - Fund together. Grow together. Go further.',
  description:
    'Pool funds with your community, earn yield on idle capital, and unlock funds based on milestones.',
  generator: 'UPool.fun',
  other: {
    'fc:frame': JSON.stringify(frameMetadata)
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <MobileDebugger />
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
