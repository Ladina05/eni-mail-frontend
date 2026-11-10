const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = localStorage.getItem('eni-mail-token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  headers.set('Accept', 'application/json')
  let response: Response
  try { response = await fetch(`${API_BASE}${path}`, { ...init, headers }) }
  catch { throw new ApiError('Serveur inaccessible. Vérifiez que le backend ENI Mail est démarré.', 0) }
  if (!response.ok) {
    let message = `La requête a échoué (${response.status}).`
    try { const payload = await response.json() as { message?: string; error?: string }; message = payload.message ?? payload.error ?? message } catch { /* No JSON error body. */ }
    if (response.status === 401) {
      localStorage.removeItem('eni-mail-token')
      localStorage.removeItem('eni-mail-user')
      window.dispatchEvent(new Event('eni-mail:unauthorized'))
    }
    throw new ApiError(message, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function get<T>(path: string) { return request<T>(path) }
export function post<T>(path: string, body: unknown) { return request<T>(path, { method: 'POST', body: JSON.stringify(body) }) }
export function patch<T>(path: string, body?: unknown) { return request<T>(path, { method: 'PATCH', ...(body === undefined ? {} : { body: JSON.stringify(body) }) }) }
export function remove<T>(path: string) { return request<T>(path, { method: 'DELETE' }) }
export function upload<T>(path: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return request<T>(path, { method: 'POST', body })
}