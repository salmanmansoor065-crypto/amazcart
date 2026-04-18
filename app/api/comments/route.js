import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const product_id = searchParams.get('product_id')

  let query = supabaseAdmin
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })

  if (product_id) query = query.eq('product_id', product_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const { product_id, author, content, rating } = body

  if (!product_id || !author?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({ product_id, author: author.trim(), content: content.trim(), rating: rating || 5 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req) {
  const token = getTokenFromRequest(req)
  if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  const { error } = await supabaseAdmin.from('comments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
