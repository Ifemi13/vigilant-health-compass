import { supabase } from './supabase'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Calls the Spring Boot API with the current Supabase access token. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body) headers.set('Content-Type', 'application/json')

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers })
  if (!res.ok) {
    // Spring returns RFC 9457 problem details: { title, detail, status }.
    const problem = await res.json().catch(() => null)
    throw new ApiError(res.status, problem?.detail ?? problem?.title ?? `Request failed (${res.status})`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

/** A user-facing message for any error thrown by apiFetch or fetch itself. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof TypeError) return "Couldn't reach the server. Is the API running?"
  return 'Something went wrong. Please try again.'
}
