'use client'

// AmazCart - Affiliate Product Store
import { useState, useEffect, useCallback } from 'react'

// FIX: safer import paths (this is the ONLY important correction)
// Make sure these files exist in /components folder at project root
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'

function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 16, marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 36 }} />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      if (search) params.set('search', search)

      const res = await fetch(`/api/products?${params}`)

      // FIX: prevent crash if API fails
      if (!res.ok) {
        setProducts([])
        setLoading(false)
        return
      }

      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch error:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = e => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const featured = products.filter(p => p.featured)
  const regular = products.filter(p => !p.featured)

  return (
    <>
      <Navbar onCategoryChange={setCategory} activeCategory={category} />

      <main style={{ background: '#F7F5F2', minHeight: '100vh' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #FFF8F5 0%, #F0F7FF 100%)', borderBottom: '1px solid #EBEBEB' }}>
          <div className="page-wrap" style={{ padding: '48px 28px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }}>
              <div>
                <span className="pill pill-orange" style={{ marginBottom: 14, display: 'inline-flex' }}>
                  Handpicked for you
                </span>

                <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, marginBottom: 12, color: '#1A1A1A' }}>
                  Top Amazon picks,<br />
                  <span style={{ color: '#FF6B35' }}>curated daily.</span>
                </h1>

                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>
                  Browse the best products, read real reviews, and shop directly on Amazon. Every link is hand-verified.
                </p>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, maxWidth: 440 }}>
                  <input
                    className="form-input"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    style={{ background: '#fff' }}
                  />
                  <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '11px 20px' }}>
                    Search
                  </button>
                </form>

                {search && (
                  <button
                    onClick={() => { setSearch(''); setSearchInput('') }}
                    style={{ marginTop: 10, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, padding: 0 }}
                  >
                    ✕ Clear search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="page-wrap" style={{ paddingTop: 40, paddingBottom: 60 }}>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <h3>No products found</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  )
}