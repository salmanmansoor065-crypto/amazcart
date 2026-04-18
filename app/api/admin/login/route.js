import { NextResponse } from 'next/server'
import { signAdminToken } from '@/lib/auth'

export async function POST(req) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
  const token = signAdminToken()
  return NextResponse.json({ token })
}
