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
    <div style={{minHeight:'100vh',background:'#FAFAFA',fontFamily:'sans-serif',display:'flex'}}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      {/* SIDEBAR */}
      <div style={{width:240,minHeight:'100vh',background:'#0D0D0D',padding:'24px 16px',position:'fixed',top:0,left:0,display:'flex',flexDirection:'column'}}>
        <div style={{textAlign:'center',padding:'0 0 24px',borderBottom:'1px solid #222',marginBottom:'16px'}}>
          <div style={{fontSize:28}}>🛒</div>
          <h2 style={{color:'#fff',fontSize:18,fontWeight:900,margin:'4px 0 2px'}}>Amaz<span style={{color:'#FF2D78'}}>Cart</span></h2>
          <p style={{color:'#555',fontSize:11,margin:0}}>Admin Panel</p>
        </div>
        {[{key:'dashboard',icon:'📊',label:'Dashboard'},{key:'products',icon:'📦',label:'Products'},{key:'add',icon:'➕',label:'Add Product'},{key:'comments',icon:'💬',label:'Comments'}].map(item=>(
          <div key={item.key} onClick={()=>{setTab(item.key);if(item.key!=='add')resetForm()}}
            style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:10,cursor:'pointer',marginBottom:4,
              background:tab===item.key?'#FF2D78':'transparent',
              color:tab===item.key?'#fff':'#888',fontWeight:tab===item.key?700:500,fontSize:14}}>
            <span>{item.icon}</span><span>{item.label}</span>
          </div>
        ))}
        <div style={{marginTop:'auto'}}>
          <div onClick={handleLogout}
            style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:10,cursor:'pointer',color:'#FF2D78',fontWeight:600,fontSize:14}}>
            🚪 Logout
          </div>
        </div>
      </div>
      {/* MAIN */}
      <div style={{marginLeft:240,padding:'32px',width:'100%'}}>
        {/* DASHBOARD */}
        {tab==='dashboard'&&(
          <div>
            <h1 style={{fontSize:26,fontWeight:900,color:'#0D0D0D',marginBottom:8}}>Dashboard</h1>
            <p style={{color:'#888',marginBottom:28}}>Welcome back, Admin!</p>
            {loading?<p>Loading...</p>:(
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:32}}>
                <div style={{background:'#fff',borderRadius:14,padding:'20px 24px',border:'1px solid #FFD6E7',boxShadow:'0 2px 8px rgba(255,45,120,0.08)'}}>
                  <p style={{fontSize:12,color:'#888',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 6px'}}>Total Products</p>
                  <p style={{fontSize:36,fontWeight:900,color:'#FF2D78',margin:0}}>{products.length}</p>
                </div>
                <div style={{background:'#fff',borderRadius:14,padding:'20px 24px',border:'1px solid #FFD6E7',boxShadow:'0 2px 8px rgba(255,45,120,0.08)'}}>
                  <p style={{fontSize:12,color:'#888',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 6px'}}>Comments</p>
                  <p style={{fontSize:36,fontWeight:900,color:'#0D0D0D',margin:0}}>{comments.length}</p>
                </div>
                <div style={{background:'#fff',borderRadius:14,padding:'20px 24px',border:'1px solid #FFD6E7',boxShadow:'0 2px 8px rgba(255,45,120,0.08)'}}>
                  <p style={{fontSize:12,color:'#888',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 6px'}}>Featured</p>
                  <p style={{fontSize:36,fontWeight:900,color:'#0D0D0D',margin:0}}>{products.filter(p=>p.featured).length}</p>
                </div>
              </div>
            )}
          </div>
        )}
        {/* PRODUCTS */}
        {tab==='products'&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h1 style={{fontSize:26,fontWeight:900,color:'#0D0D0D',margin:0}}>Products</h1>
              <button onClick={()=>setTab('add')} style={{background:'#FF2D78',color:'#fff',border:'none',borderRadius:10,padding:'10px 20px',fontWeight:700,cursor:'pointer',fontSize:14}}>+ Add Product</button>
            </div>
            <input placeholder="🔍 Search products..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              style={{width:'100%',padding:'10px 16px',borderRadius:10,border:'2px solid #FFD6E7',marginBottom:16,fontSize:14,boxSizing:'border-box',outline:'none'}}/>
            {loading?<p>Loading...</p>:(
              <div style={{background:'#fff',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #FFD6E7'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#FFF0F5'}}>
                      {['Image','Name','Category','Featured','Actions'].map(h=>(
                        <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#FF2D78',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p,i)=>(
                      <tr key={p.id} style={{borderTop:'1px solid #FFF0F5',background:i%2===0?'#fff':'#FAFAFA'}}>
                        <td style={{padding:'12px 16px'}}>
                          {p.image_url?<img src={p.image_url} alt={p.name} style={{width:44,height:44,objectFit:'cover',borderRadius:8,border:'2px solid #FFD6E7'}}/>
                            :<div style={{width:44,height:44,background:'#FFF0F5',borderRadius:8,border:'2px solid #FFD6E7'}}/>}
                        </td>
                        <td style={{padding:'12px 16px',fontWeight:600,fontSize:14,color:'#0D0D0D'}}>{p.name}</td>
                        <td style={{padding:'12px 16px'}}>
                          <span style={{background:'#FFF0F5',color:'#FF2D78',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>{p.category}</span>
                        </td>
                        <td style={{padding:'12px 16px'}}>{p.featured?'⭐ Yes':'—'}</td>
                        <td style={{padding:'12px 16px'}}>
                          <button onClick={()=>startEdit(p)} style={{background:'#FFF0F5',color:'#FF2D78',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,cursor:'pointer',marginRight:8,fontSize:13}}>Edit</button>
                          <button onClick={()=>handleDelete(p.id)} style={{background:'#0D0D0D',color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,cursor:'pointer',fontSize:13}}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length===0&&<tr><td colSpan={5} style={{padding:32,textAlign:'center',color:'#888'}}>No products found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* ADD/EDIT */}
        {tab==='add'&&(
          <div>
            <h1 style={{fontSize:26,fontWeight:900,color:'#0D0D0D',marginBottom:24}}>{editingId?'Edit Product':'Add Product'}</h1>
            <div style={{background:'#fff',borderRadius:14,padding:32,boxShadow:'0 2px 8px rgba(0,0,0,0.06)',maxWidth:580,border:'1px solid #FFD6E7'}}>
              <form onSubmit={handleSave}>
                {[{label:'Product Name *',name:'name',placeholder:'Enter product name'},{label:'Affiliate Link *',name:'affiliate_link',placeholder:'https://...'}].map(f=>(
                  <div key={f.name} style={{marginBottom:16}}>
                    <label style={{fontSize:13,fontWeight:700,color:'#0D0D0D',display:'block',marginBottom:6}}>{f.label}</label>
                    <input name={f.name} value={form[f.name]} onChange={handleFormChange} placeholder={f.placeholder}
                      style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'2px solid #FFD6E7',fontSize:14,boxSizing:'border-box',outline:'none'}}
                      onFocus={e=>e.target.style.border='2px solid #FF2D78'}
                      onBlur={e=>e.target.style.border='2px solid #FFD6E7'}/>
                  </div>
                ))}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:13,fontWeight:700,color:'#0D0D0D',display:'block',marginBottom:6}}>Description *</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Enter product description" rows={4}
                    style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'2px solid #FFD6E7',fontSize:14,boxSizing:'border-box',resize:'vertical',outline:'none'}}
                    onFocus={e=>e.target.style.border='2px solid #FF2D78'}
                    onBlur={e=>e.target.style.border='2px solid #FFD6E7'}/>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:13,fontWeight:700,color:'#0D0D0D',display:'block',marginBottom:6}}>Category *</label>
                  <select name="category" value={form.category} onChange={handleFormChange}
                    style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'2px solid #FFD6E7',fontSize:14,boxSizing:'border-box',outline:'none'}}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:13,fontWeight:700,color:'#0D0D0D',display:'block',marginBottom:6}}>Product Image</label>
                  <input type="file" accept="image/*" onChange={handleImgChange} ref={imgRef}/>
                  {imgPreview&&<img src={imgPreview} alt="preview" style={{marginTop:10,width:100,height:100,objectFit:'cover',borderRadius:10,border:'2px solid #FFD6E7'}}/>}
                </div>
                <div style={{marginBottom:24,display:'flex',alignItems:'center',gap:8}}>
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleFormChange} id="featured" style={{accentColor:'#FF2D78',width:16,height:16}}/>
                  <label htmlFor="featured" style={{fontSize:14,fontWeight:600,color:'#0D0D0D',cursor:'pointer'}}>Featured Product ⭐</label>
                </div>
                <div style={{display:'flex',gap:12}}>
                  <button type="submit" disabled={saving||uploading}
                    style={{background:'#FF2D78',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontWeight:700,cursor:'pointer',fontSize:15}}>
                    {saving?'Saving...':uploading?'Uploading...':editingId?'Update Product':'Add Product'}
                  </button>
                  {editingId&&<button type="button" onClick={resetForm}
                    style={{background:'#0D0D0D',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer'}}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}
        {/* COMMENTS */}
        {tab==='comments'&&(
          <div>
            <h1 style={{fontSize:26,fontWeight:900,color:'#0D0D0D',marginBottom:24}}>Comments</h1>
            {loading?<p>Loading...</p>:(
              <div style={{background:'#fff',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #FFD6E7'}}>
                {comments.length===0
                  ?<p style={{padding:32,textAlign:'center',color:'#888'}}>No comments yet</p>
                  :comments.map(c=>(
                    <div key={c.id} style={{padding:'16px 24px',borderBottom:'1px solid #FFF0F5'}}>
                      <p style={{fontWeight:700,fontSize:14,color:'#0D0D0D',margin:'0 0 4px'}}>{c.author||'Anonymous'}</p>
                      <p style={{color:'#555',fontSize:14,margin:0}}>{c.content||c.text||c.comment}</p>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}