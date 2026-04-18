import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(req) {
  const token = getTokenFromRequest(req)
  if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ count: products }, { count: comments }, { data: cats }] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('comments').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('category'),
  ])

  const categoryMap = {}
  cats?.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1
  })

  return NextResponse.json({ products: products || 0, comments: comments || 0, categories: categoryMap })
}
