const SESSION_KEY = 'seller_session'

export interface SellerSession {
  id: string
  name: string
  brand_name: string
  email: string
}

export function getSession(): SellerSession | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as SellerSession } catch { return null }
}

export function setSession(session: SellerSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSellerId(): string | null {
  return getSession()?.id ?? null
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated(): boolean {
  return !!getSellerId()
}

export async function logout(): Promise<void> {
  clearToken()
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
}
