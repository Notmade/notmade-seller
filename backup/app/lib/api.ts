import { getToken } from './auth'

const BASE = 'https://api.notmade.in'

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const isFormData = init.body instanceof FormData

  const headers: Record<string, string> = {}
  if (init.body && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(`${BASE}${path}`, { ...init, headers })
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path)
  if (!res.ok) throw new Error(String(res.status))
  const data: unknown = await res.json()
  return data as T
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; message?: string }
    throw new Error(err.error ?? err.message ?? String(res.status))
  }
  const data: unknown = await res.json()
  return data as T
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; message?: string }
    throw new Error(err.error ?? err.message ?? String(res.status))
  }
  const data: unknown = await res.json()
  return data as T
}
