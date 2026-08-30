import { Inter, JetBrains_Mono, Merriweather } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { ReactQueryProvider } from '@/providers/react-query-provider'
import { ReactQueryDevtoolsPanel } from '@/providers/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getSiteMetadata } from '@/config/site'
import { getSiteUrl } from '@/utils/site-url'

export const metadata = getSiteMetadata(getSiteUrl())

const inter = Inter({
  variable: '--font-inter',
  display: 'swap',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  display: 'swap',
  subsets: ['latin'],
})

const merriweather = Merriweather({
  variable: '--font-merriweather',
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '700'],
})

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable} scroll-pt-20 scroll-smooth motion-reduce:scroll-auto`}
    >
      <body className="font-sans antialiased">
        <NextTopLoader showSpinner={false} height={2} color="var(--primary)" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
            <Analytics />
            <ReactQueryDevtoolsPanel />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
