import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/providers/wallet-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UPool - Fund together. Grow together. Go further.',
  description:
    'Pool funds with your community, earn yield on idle capital, and unlock funds based on milestones.',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
