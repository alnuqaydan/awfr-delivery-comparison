import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({ 
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AWFR - مقارنة أسعار التوصيل الذكي | Smart Delivery Price Comparison',
  description: 'Compare delivery prices from Mrsool, Jahez, HungerStation, ToYou, Lugmety, and Careem in Saudi Arabia. Find the best delivery deals instantly.',
  keywords: 'delivery, Saudi Arabia, price comparison, food delivery, Mrsool, Jahez, HungerStation, ToYou, Lugmety, Careem, أوفر',
  authors: [{ name: 'AWFR Team' }],
  creator: 'AWFR',
  publisher: 'AWFR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://awfr.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AWFR - Smart Delivery Price Comparison',
    description: 'Compare delivery prices from major providers in Saudi Arabia',
    url: 'https://awfr.app',
    siteName: 'AWFR',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AWFR - Smart Delivery Price Comparison',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AWFR - Smart Delivery Price Comparison',
    description: 'Compare delivery prices from major providers in Saudi Arabia',
    images: ['/images/og-image.png'],
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <Providers>
          <ThemeRegistry>
            {children}
          </ThemeRegistry>
        </Providers>
      </body>
    </html>
  );
}
