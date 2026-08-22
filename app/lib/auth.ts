const KEY = 'seller_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, token)
  document.cookie = `${KEY}=${token}; path=/; max-age=604800; SameSite=Lax`
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
  document.cookie = `${KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
