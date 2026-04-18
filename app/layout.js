import './globals.css'

export const metadata = {
  title: 'AmazCart — Curated Amazon Picks',
  description: 'Handpicked Amazon products with real reviews.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}