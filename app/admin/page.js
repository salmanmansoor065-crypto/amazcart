'use client'

import { useState, useEffect, useRef } from 'react'
import Toast from '../../components/Toast'

const CATEGORIES = ['Tech', 'Home', 'Fashion', 'Books', 'Sports', 'Beauty']
const EMPTY_FORM = { name: '', description: '', affiliate_link: '', category: 'Tech', featured: false, image_url: '' }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [comments, setComments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const imgRef = useRef()

  useEffect(() => {
    const saved = localStorage.getItem('ac_token')
    if (saved) { setToken(saved); setAuthed(true) }
  }, [])

  useEffect(() => { if (authed && token) fetchAll() }, [authed, token])

  async function fetchAll() {
    setLoading(true)
    const [pr, co, st] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/comments').then(r => r.json()),
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
    setProducts(Array.isArray(pr) ? pr : [])
    setComments(Array.isArray(co) ? co : [])
    setStats(st)
    setLoading(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    if (res.ok) { setToken(data.token); localStorage.setItem('ac_token', data.token); setAuthed(true) }
    else setLoginError(data.error || 'Invalid password')
    setLoginLoading(false)
  }

  function handleLogout() {
    localStorage.removeItem('ac_token')
    setAuthed(false); setToken(''); setPassword('')
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleImgChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  async function uploadImage() {
    if (!imgFile) return form.image_url || ''
    setUploading(true)
    const fd = new FormData()
    fd.append('file', imgFile)
    const res = await fetch('/api/products/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data.url
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name || !form.description || !form.affiliate_link || !form.category) {
      setToast({ message: 'Please fill in all required fields.', type: 'error' }); return
    }
    setSaving(true)
    try {
      const image_url = await uploadImage()
      const payload = { ...form, image_url }
      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error)
      setToast({ message: editingId ? 'Product updated!' : 'Product added!', type: 'success' })
      resetForm(); fetchAll()
    } catch (err) { setToast({ message: err.message, type: 'error' }) }
    setSaving(false)
  }

  function startEdit(p) {
    setForm({ name: p.name, description: p.description, affiliate_link: p.affiliate_link, category: p.category, featured: p.featured || false, image_url: p.image_url || '' })
    setEditingId(p.id); setImgPreview(p.image_url || null); setImgFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm(EMPTY_FORM); setEditingId(null); setImgFile(null); setImgPreview(null)
    if (imgRef.current) imgRef.current.value = ''
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) { setToast({ message: 'Product deleted.', type: 'success' }); fetchAll() }
    else setToast({ message: 'Delete failed.', type: 'error' })
  }

  const filteredProducts = products.filter(p => {
    const matchCat = catFilter === 'All' || p.category === catFilter
    const matchSearch = p.name.toLowerCase().includes(searchQ.toLowerCase())
    return matchCat && matchSearch
  })

  // ── LOGIN PAGE ──────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1A1A', margin: '0 0 2px' }}>
            Amaz<span style={{ color: '#FF6B35' }}>Cart</span>
          </h1>
          <p style={{ color: '#888', fontSize: 13, margin: 0 }}>Admin access — enter your password</p>
        </div>
        <form onSubmit={handleLogin}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Admin password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 15, boxSizing: 'border-box', outline: 'none', marginBottom: 12 }}
            onFocus={e => e.target.style.border = '1.5px solid #FF6B35'}
            onBlur={e => e.target.style.border = '1.5px solid #E0E0E0'}
          />
          {loginError && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 10 }}>{loginError}</p>}
          <button type="submit" disabled={loginLoading}
            style={{ width: '100%', padding: '12px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {loginLoading ? 'Signing in...' : 'Sign in'}
          </button>
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 16 }}>This page is only for the site owner</p>
        </form>
      </div>
    </div>
  )

  // ── ADMIN PANEL ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', fontFamily: 'sans-serif' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* TOP BAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
          Amaz<span style={{ color: '#FF6B35' }}>Cart</span> <span style={{ fontSize: 14, fontWeight: 500, color: '#888' }}>Admin</span>
        </h1>
        <button onClick={handleLogout}
          style={{ background: 'none', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 600, color: '#666', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total products', value: products.length, color: '#FF6B35', bg: '#FFF0EB' },
            { label: 'Total comments', value: comments.length, color: '#6B7280', bg: '#F3F4F6' },
            { label: 'Clicks today', value: stats?.clicks_today ?? 0, color: '#6B7280', bg: '#F3F4F6' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '20px 24px', border: '1px solid #EBEBEB' }}>
              <p style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>{s.label}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

          {/* ADD / EDIT FORM */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #EBEBEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 20px' }}>
              {editingId ? '✏️ Edit product' : '➕ Add new product'}
            </h2>
            <form onSubmit={handleSave}>
              {[
                { label: 'Product name', name: 'name', placeholder: 'e.g. Sony WH-1000XM5' },
                { label: 'Amazon affiliate link', name: 'affiliate_link', placeholder: 'https://amzn.to/...' },
              ].map(f => (
                <div key={f.name} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input name={f.name} value={form[f.name]} onChange={handleFormChange} placeholder={f.placeholder}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                    onFocus={e => e.target.style.border = '1.5px solid #FF6B35'}
                    onBlur={e => e.target.style.border = '1.5px solid #E0E0E0'}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange}
                  placeholder="Why should someone buy this product?" rows={3}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', outline: 'none' }}
                  onFocus={e => e.target.style.border = '1.5px solid #FF6B35'}
                  onBlur={e => e.target.style.border = '1.5px solid #E0E0E0'}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Category</label>
                <select name="category" value={form.category} onChange={handleFormChange}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Upload product image</label>
                <input type="file" accept="image/*,.png,.jpg,.jpeg,.gif,.webp" onChange={handleImgChange} ref={imgRef}
                  style={{ fontSize: 12, color: '#555' }} />
                <p style={{ fontSize: 11, color: '#aaa', margin: '4px 0 0' }}>PNG or JPG, max 5MB</p>
                {imgPreview && <img src={imgPreview} alt="preview" style={{ marginTop: 8, width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #E0E0E0' }} />}
              </div>
              <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleFormChange} id="featured" style={{ accentColor: '#FF6B35', width: 15, height: 15 }} />
                <label htmlFor="featured" style={{ fontSize: 13, color: '#555', cursor: 'pointer' }}>Featured product</label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving || uploading}
                  style={{ flex: 1, padding: '10px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : uploading ? 'Uploading...' : editingId ? 'Update' : 'Add product'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm}
                    style={{ padding: '10px 16px', background: '#F3F4F6', color: '#555', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* PRODUCTS LIST */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #EBEBEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Products ({filteredProducts.length})</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, outline: 'none', width: 140 }}
                  onFocus={e => e.target.style.border = '1.5px solid #FF6B35'}
                  onBlur={e => e.target.style.border = '1.5px solid #E0E0E0'}
                />
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, outline: 'none' }}>
                  <option value="All">All</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {loading ? <p style={{ color: '#888', fontSize: 14 }}>Loading...</p> : filteredProducts.length === 0 ? (
              <p style={{ color: '#888', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No products found</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredProducts.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, background: i % 2 === 0 ? '#FAFAFA' : '#fff', border: '1px solid #F0F0F0' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #E0E0E0', flexShrink: 0 }} />
                      : <div style={{ width: 48, height: 48, background: '#FFF0EB', borderRadius: 8, flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                      <span style={{ background: '#FFF0EB', color: '#FF6B35', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.category}</span>
                      {p.featured && <span style={{ marginLeft: 6, fontSize: 11, color: '#888' }}>⭐ Featured</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => startEdit(p)}
                        style={{ background: '#FFF0EB', color: '#FF6B35', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}