'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const CATEGORIES = ['All', 'Tech', 'Home', 'Fashion', 'Books', 'Sports', 'Beauty']

export default function Navbar({ onCategoryChange, activeCategory = 'All' }) {
  const router = useRouter()
  const pathname = usePathname()
  const isStore = pathname === '/'

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #EBEBEB',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <img src="/logo.svg" alt="AmazCart" style={{ width: 32, height: 32, borderRadius: 8 }} />
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
                <span style={{ color: '#FF6B35' }}>Amaz</span>
                <span style={{ color: '#1A1A1A' }}>Cart</span>
              </span>
            </span>
          </Link>
          {isStore && (
            <div style={{ display: 'flex', gap: 2 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange?.(cat)}
                  style={{
                    background: activeCategory === cat ? '#FFF0EB' : 'transparent',
                    color: activeCategory === cat ? '#C94A1A' : '#666',
                    border: 'none',
                    padding: '6px 13px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: activeCategory === cat ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }}>Store</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
