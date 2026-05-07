import type { Metadata } from 'next'
import { Fraunces, Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { Toaster } from '@/components/ui/sonner'

const fraunces = Fraunces({
  variable: '--font-heading',
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
})

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Coffee Corner',
  description: 'Tracker personal de café de especialidad',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-2xl px-4 py-6 pb-24 flex-1">
            {children}
          </main>
          <BottomNav />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
