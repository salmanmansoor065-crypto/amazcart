import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'fallback-dev-secret'

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, SECRET, { expiresIn: '7d' })
}

export function verifyAdminToken(token) {
  try {
    const payload = jwt.verify(token, SECRET)
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export function getTokenFromRequest(req) {
  const auth = req.headers.get('authorization') || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}
