const TOKEN_KEY = 'seller_token'
const SESSION_KEY = 'seller_session'

export interface SellerSession {
  id: string
  name: string
  brand_name: string
  email: string
  must_change_password?: boolean
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`
}

export function setSession(session: SellerSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  document.cookie = `${TOKEN_KEY}=${session.id}; path=/; max-age=604800; SameSite=Lax`
}

export function getSession(): SellerSession | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as SellerSession } catch { return null }
}

export function getSellerId(): string | null {
  return getSession()?.id ?? null
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(SESSION_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
}

export function isAuthenticated(): boolean {
  return !!getSellerId()
}
