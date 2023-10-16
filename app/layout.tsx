import Header from './components/Header'
import './globals.css'
import type { Metadata } from 'next'
import APINavColumn from './components/APINavColumn'
import Main from './components/Main'

export const metadata: Metadata = {
  title: 'Engine Example',
  description: 'Shows usage of the @ezkljs/engine package in a Next.js app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className='m-0 h-screen flex flex-col'>
        {/* <!-- Top Navbar --> */}
        <Header />

        {/* <!-- Content Area --> */}
        <div className='flex-grow flex flex-row mt-16'>
          {/* <!-- Left Navigation Column --> */}
          <APINavColumn />

          {/* <!-- Main Content Area --> */}
          <Main>{children}</Main>
        </div>
      </body>
    </html>
  )
}
