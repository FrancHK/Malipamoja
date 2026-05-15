import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: { default: 'MaliPamoja', template: '%s · MaliPamoja' },
  description: 'Mfumo wa kisasa wa VICOBA — akiba, mikopo, na uwazi wa fedha',
  keywords: ['VICOBA', 'savings', 'loans', 'group finance', 'Tanzania'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw" className={`${geist.variable} h-full`} data-scroll-behavior="smooth">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
