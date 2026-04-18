'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'

const CAT_STYLES = {
  Tech:    { pill: 'pill-orange', bg: '#FFF8F5' },
  Home:    { pill: 'pill-green',  bg: '#F5FFF8' },
  Fashion: { pill: 'pill-blue',   bg: '#F0F7FF' },
  Books:   { pill: 'pill-blue',   bg: '#F0F7FF' },
  Sports:  { pill: 'pill-green',  bg: '#F5FFF8' },
  Beauty:  { pill: 'pill-orange', bg: '#FFF8F5' },
  default: { pill: 'pill-gray',   bg: '#F7F5F2' },
}

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.json()),
      fetch(`/api/comments?product_id=${id}`).then(r => r.json()),
    ]).then(([prod, comms]) => {
      setProduct(prod)
      setComments(Array.isArray(comms) ? comms : [])
      setLoading(false)
    })
  }, [id])

  const avgRating = comments.length
    ? Math.round(comments.reduce((a, c) => a + (c.rating || 5), 0) / comments.length)
    : 5

  async function submitComment(e) {
    e.preventDefault()
    if (!author.trim() || !content.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, author, content, rating }),
    })
    if (res.ok) {
      const newComment = await res.json()
      setComments(prev => [newComment, ...prev])
      setAuthor(''); setContent(''); setRating(5)
      setToast({ message: 'Comment posted!', type: 'success' })
    } else {
      setToast({ message: 'Failed to post comment.', type: 'error' })
    }
    setSubmitting(false)
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="skeleton" style={{ height: 24, width: '60%' }} />
            <div className="skeleton" style={{ height: 36 }} />
            <div className="skeleton" style={{ height: 100 }} />
            <div className="skeleton" style={{ height: 44 }} />
          </div>
        </div>
      </div>
    </>
  )

  if (!product || product.error) return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Product not found</h2>
        <Link href="/" className="btn-primary">Back to store</Link>
      </div>
    </>
  )

  const style = CAT_STYLES[product.category] || CAT_STYLES.default

  return (
    <>
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <main style={{ background: '#F7F5F2', minHeight: '100vh' }}>
        <div className="page-wrap" style={{ paddingTop: 36, paddingBottom: 60 }}>

          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#888', fontSize: 14, marginBottom: 28, fontWeight: 500 }}>
            ← Back to store
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 40, marginBottom: 48 }}>
            {/* Image */}
            <div>
              <div style={{ background: style.bg, borderRadius: 20, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EBEBEB', position: 'relative', overflow: 'hidden', marginBottom: 12 }}>
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: 16, background: '#E8E4DE' }} />
                )}
              </div>
            </div>

            {/* Info */}
            <div style={{ paddingTop: 8 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <span className={`pill ${style.pill}`}>{product.category}</span>
                <span className="pill pill-green">In stock</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, lineHeight: 1.3, color: '#1A1A1A' }}>{product.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span className="stars" style={{ fontSize: 16 }}>{'★'.repeat(avgRating)}{'☆'.repeat(5 - avgRating)}</span>
                <span style={{ fontSize: 13, color: '#888' }}>{avgRating.toFixed(1)} out of 5 · {comments.length} review{comments.length !== 1 ? 's' : ''}</span>
              </div>

              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 24 }}>{product.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[['Category', product.category], ['Reviews', comments.length], ['Featured', product.featured ? 'Yes' : 'No'], ['Status', 'Available']].map(([k, v]) => (
                  <div key={k} style={{ background: '#F7F5F2', borderRadius: 10, padding: '12px 14px', border: '1px solid #EBEBEB' }}>
                    <p style={{ fontSize: 11, color: '#aaa', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</p>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{v}</p>
                  </div>
                ))}
              </div>

              <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary" style={{ display: 'block', textAlign: 'center', fontSize: 16, padding: '14px 0', borderRadius: 12, marginBottom: 10 }}>
                Buy on Amazon →
              </a>
              <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>Affiliate link — we may earn a commission at no extra cost to you.</p>
            </div>
          </div>

          {/* Comments */}
          <div className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
              Customer reviews <span style={{ color: '#aaa', fontWeight: 400, fontSize: 16 }}>({comments.length})</span>
            </h2>

            {/* Comment form */}
            <div style={{ background: '#F7F5F2', borderRadius: 16, padding: 24, marginBottom: 32, border: '1px solid #EBEBEB' }}>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Leave a review</p>
              <form onSubmit={submitComment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="form-input" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name" required style={{ background: '#fff' }} />

                {/* Star picker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>Rating:</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(s => (
                      <span
                        key={s}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}
                        style={{ cursor: 'pointer', fontSize: 24, color: s <= (hoverRating || rating) ? '#F59E0B' : '#DDD', transition: 'color 0.1s' }}
                      >★</span>
                    ))}
                  </div>
                </div>

                <textarea className="form-input" value={content} onChange={e => setContent(e.target.value)} placeholder="Share your experience with this product..." rows={3} required style={{ background: '#fff' }} />
                <div>
                  <button type="submit" className="btn-primary" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1, padding: '10px 24px' }}>
                    {submitting ? 'Posting...' : 'Post review'}
                  </button>
                </div>
              </form>
            </div>

            {/* Comment list */}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>💬</p>
                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No reviews yet</p>
                <p style={{ fontSize: 13 }}>Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div>
                {comments.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', gap: 14, padding: '18px 0', borderBottom: i < comments.length - 1 ? '1px solid #F0EDE8' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#C94A1A', flexShrink: 0 }}>
                      {c.author?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 14, marginRight: 8 }}>{c.author}</span>
                          <span className="stars" style={{ fontSize: 12 }}>{'★'.repeat(c.rating || 5)}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#ccc' }}>{new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer style={{ borderTop: '1px solid #EBEBEB', background: '#fff', padding: '24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#aaa' }}>
            As an Amazon Associate, AmazCart earns from qualifying purchases. © {new Date().getFullYear()} AmazCart
          </p>
        </footer>
      </main>
    </>
  )
}
