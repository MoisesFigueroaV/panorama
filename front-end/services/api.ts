// Servicio base para llamadas a API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  cache?: RequestCache
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, cache } = options

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache,
  }

  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`)
  }

  // Para endpoints que no devuelven JSON
  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json()
  }

  return {} as T
}
