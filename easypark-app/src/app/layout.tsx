import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EasyPark — Find. Reserve. Pay. Park.',
  description: 'Sri Lanka\'s smart parking discovery, reservation and payment platform. Find private and government parking across Colombo, Malabe, Battaramulla and more.',
  keywords: 'parking, Sri Lanka, Colombo, reserve parking, smart parking, EasyPark',
  openGraph: {
    title: 'EasyPark — Find. Reserve. Pay. Park.',
    description: 'Smart parking for Sri Lanka',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
