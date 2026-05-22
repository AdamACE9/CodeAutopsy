import type { Metadata } from 'next'
import { Syne, Chivo_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const chivoMono = Chivo_Mono({
  subsets: ['latin'],
  variable: '--font-chivo-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'CodeAutopsy — AI-Powered Code Analysis',
  description: 'Roast, fix, explain, scan, audit, refactor, and score your code with AI. Powered by Groq.',
  keywords: ['code analysis', 'AI', 'code review', 'security scan', 'performance audit'],
  openGraph: {
    title: 'CodeAutopsy',
    description: 'AI-powered code analysis. Roast. Fix. Explain. Scan. Audit.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${chivoMono.variable} font-sans bg-bg text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
