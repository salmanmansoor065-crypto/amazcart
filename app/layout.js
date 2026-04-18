import './globals.css'

export const metadata = {
  title: 'AmazCart — Curated Amazon Picks',
  description: 'Handpicked Amazon products with real reviews.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
