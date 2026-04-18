import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(req, { params }) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req, { params }) {
  const token = getTokenFromRequest(req)
  if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, affiliate_link, category, image_url, featured } = body

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ name, description, affiliate_link, category, image_url, featured })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  const token = getTokenFromRequest(req)
  if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('image_url')
    .eq('id', params.id)
    .single()

  if (product?.image_url) {
    const filename = product.image_url.split('/').pop()
    await supabaseAdmin.storage.from('product-images').remove([filename])
  }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
