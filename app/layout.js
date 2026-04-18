import './globals.css'

export const metadata = {
  title: 'AmazCart — Curated Amazon Picks',
  description: 'Handpicked Amazon products with real reviews.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}