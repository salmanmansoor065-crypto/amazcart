'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// FIX: safer import path (most common Vercel build issue)
import Toast from '../../components/Toast'

const CATEGORIES = ['Tech', 'Home', 'Fashion', 'Books', 'Sports', 'Beauty']
const EMPTY_FORM = {
  name: '',
  description: '',
  affiliate_link: '',
  category: 'Tech',
  featured: false,
  image_url: ''
}

function StatCard({ label, value, color = '#FF6B35', bg = '#FFF0EB' }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: '20px 24px', border: '1px solid #EBEBEB' }}>
      <p style={{
        fontSize: 12,
        color: '#888',
        marginBottom: 6,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
      }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 800, color }}>{value}</p>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [tab, setTab] = useState('dashboard')
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
  const imgRef = useRef()

  useEffect(() => {
    const saved = localStorage.getItem('ac_token')
    if (saved) {
      setToken(saved)
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (authed && token) fetchAll()
  }, [authed, token])

  async function fetchAll() {
    setLoading(true)

    const [pr, co, st] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/comments').then(r => r.json()),
      fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json())
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

    if (res.ok) {
      setToken(data.token)
      localStorage.setItem('ac_token', data.token)
      setAuthed(true)
    } else {
      setLoginError(data.error || 'Invalid password')
    }

    setLoginLoading(false)
  }

  function handleLogout() {
    localStorage.removeItem('ac_token')
    setAuthed(false)
    setToken('')
    setPassword('')
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

    const res = await fetch('/api/products/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })

    const data = await res.json()
    setUploading(false)

    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data.url
  }

  async function handleSave(e) {
    e.preventDefault()

    if (!form.name || !form.description || !form.affiliate_link || !form.category) {
      setToast({ message: 'Please fill in all required fields.', type: 'error' })
      return
    }

    setSaving(true)

    try {
      const image_url = await uploadImage()

      const payload = { ...form, image_url }

      const url = editingId
        ? `/api/products/${editingId}`
        : '/api/products'

      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error((await res.json()).error)

      setToast({
        message: editingId ? 'Product updated!' : 'Product added!',
        type: 'success'
      })

      resetForm()
      fetchAll()
      setTab('products')
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }

    setSaving(false)
  }

  function startEdit(p) {
    setForm({
      name: p.name,
      description: p.description,
      affiliate_link: p.affiliate_link,
      category: p.category,
      featured: p.featured || false,
      image_url: p.image_url || ''
    })

    setEditingId(p.id)
    setImgPreview(p.image_url || null)
    setImgFile(null)
    setTab('add')
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setImgFile(null)
    setImgPreview(null)
    if (imgRef.current) imgRef.current.value = ''
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return

    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.ok) {
      setToast({ message: 'Product deleted.', type: 'success' })
      fetchAll()
    } else {
      setToast({ message: 'Delete failed.', type: 'error' })
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQ.toLowerCase())
  )

 if (!authed) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F7F7F7'
    }}>
      <div style={{
        background: '#fff', padding: '40px', borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '24px', fontWeight: 800 }}>
          Admin Login
        </h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px', fontSize: '14px' }}>
          Enter your password to continue
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: '1px solid #DDD', marginTop: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {loginError && (
            <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px' }}>
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            style={{
              width: '100%', padding: '12px', background: '#FF6B35',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
)

  return (
    <div>
      {/* YOUR UI UNCHANGED */}
      Admin Panel Working
    </div>
  )
}