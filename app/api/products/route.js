import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  let query = supabaseAdmin
    .from('products')
    .select(`*, comments(count)`)
    .order('created_at', { ascending: false })

  if (category && category !== 'All') query = query.eq('category', category)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const products = data.map(p => ({
    ...p,
    comment_count: p.comments?.[0]?.count || 0,
  }))

  return NextResponse.json(products)
}

export async function POST(req) {
  const token = getTokenFromRequest(req)
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, affiliate_link, category, image_url, featured } = body

  if (!name || !description || !affiliate_link || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ name, description, affiliate_link, category, image_url: image_url || null, featured: featured || false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
