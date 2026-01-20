import { ApiError, type ApiErrorPayload } from './errors'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue }

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | null | undefined>
  headers?: Record<string, string>
  body?: JsonValue | FormData
  signal?: AbortSignal
}

export type HttpClientOptions = {
  baseUrl?: string
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions['query']
) {
  const isAbs = /^https?:\/\//i.test(path)
  const url = new URL(isAbs ? path : baseUrl + path, window.location.origin)

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === null || v === undefined) continue
      url.searchParams.set(k, String(v))
    }
  }

  return url.toString()
}

function isFormData(x: unknown): x is FormData {
  return typeof FormData !== 'undefined' && x instanceof FormData
}

async function readErrorPayloadSafe(
  resp: Response
): Promise<ApiErrorPayload | undefined> {
  const ct = resp.headers.get('content-type') || ''
  if (!ct.includes('application/json')) return undefined
  try {
    return (await resp.json()) as ApiErrorPayload
  } catch {
    return undefined
  }
}

export class HttpClient {
  private baseUrl: string

  constructor(opts: HttpClientOptions = {}) {
    this.baseUrl = opts.baseUrl ?? ''
  }

  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const url = buildUrl(this.baseUrl, path, opts.query)

    const headers: Record<string, string> = {
      ...opts.headers,
    }

    let body: BodyInit | undefined

    if (opts.body !== undefined) {
      if (isFormData(opts.body)) {
        body = opts.body
      } else {
        headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
        body = JSON.stringify(opts.body)
      }
    }

    const resp = await fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      body,
      signal: opts.signal,
      credentials: 'include',
    })

    if (!resp.ok) {
      const payload = await readErrorPayloadSafe(resp)
      const message = payload?.detail || `HTTP ${resp.status}`
      throw new ApiError({ status: resp.status, url, message, payload })
    }

    if (resp.status === 204) return undefined as T

    const contentType = resp.headers.get('content-type') || ''

    // Бинарные ответы (PDF/Blob)
    if (
      contentType.includes('application/pdf') ||
      contentType.includes('application/octet-stream')
    ) {
      return (await resp.blob()) as unknown as T
    }

    // JSON
    if (contentType.includes('application/json')) {
      return (await resp.json()) as T
    }

    // Текст
    return (await resp.text()) as unknown as T
  }
}
