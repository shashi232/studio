import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';

export const metadata: Metadata = {
  title: 'SmartStep Companion',
  description: 'A companion app for your smart walking stick.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 px-4 pt-4 pb-24 md:px-6">
              {children}
            </main>
            <BottomNav />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
