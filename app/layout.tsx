import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CareerCare AI — Turn your CV into a career strategy',
  description: 'AI-powered career reflection tool. Upload your CV, answer 7 questions, get a personalised career workbook in 15 minutes.',
  openGraph: {
    title: 'CareerCare AI',
    description: 'From CV to career strategy in 15 minutes.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
