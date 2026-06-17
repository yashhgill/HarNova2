import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Fraunces } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const mono  = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: { default: 'HarNova — AI Website Builder', template: '%s | HarNova' },
  description: 'Build, deploy and manage websites with AI. Made for Malaysian SMEs.',
  metadataBase: new URL('https://harnova.my'),
  openGraph: {
    title: 'HarNova — AI Website Builder for Malaysian SMEs',
    description: 'Build and deploy your business website in minutes using AI.',
    url: 'https://harnova.my',
    siteName: 'HarNova',
    locale: 'en_MY',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${fraunces.variable}`}>
      <body className="bg-surface-50 text-gray-900 antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
        {children}
      </body>
    </html>
  )
}
