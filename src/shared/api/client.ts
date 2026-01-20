import { HttpClient } from './http'
import { AuthManager } from './auth'
import type { CreateUserBody, ImageDTO, LoginBody, UserDTO } from './types'

export class CockApi {
  private http: HttpClient

  auth: AuthManager

  constructor(http = new HttpClient({ baseUrl: '/api' })) {
    this.http = http
    this.auth = new AuthManager(this)
  }

  // ---------- health ----------
  healthServer() {
    return this.http.request<Record<string, unknown>>('/health/server')
  }

  healthDb() {
    return this.http.request<Record<string, unknown>>('/health/db')
  }

  healthMinio() {
    return this.http.request<Record<string, unknown>>('/health/minio')
  }

  // ---------- auth ----------
  createUser(body: CreateUserBody) {
    return this.http.request<UserDTO>('/users/create', { method: 'POST', body })
  }

  async login(body: LoginBody) {
    const res = await this.http.request<Record<string, unknown> | undefined>(
      '/auth/login',
      {
        method: 'POST',
        body,
      }
    )
    this.auth.invalidate()
    return res
  }

  async logout() {
    const res = await this.http.request<Record<string, unknown> | undefined>(
      '/auth/logout',
      {
        method: 'POST',
      }
    )
    this.auth.invalidate()
    return res
  }

  // ---------- me ----------
  me() {
    return this.http.request<Record<string, unknown>>('/me')
  }

  // ---------- images ----------
  uploadImage(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    return this.http.request<ImageDTO>('/users/upload_image', {
      method: 'POST',
      body: fd,
    })
  }

  getAllUserImages() {
    return this.http.request<ImageDTO[]>('/users/get_all_user_images')
  }

  deleteImage(url: string) {
    return this.http.request<Record<string, string>>('/users/delete_image', {
      method: 'DELETE',
      query: { url },
    })
  }

  // ---------- OCR ----------
  async ocrToPdf(file: File): Promise<Blob> {
    await this.auth.requireAuth()

    const fd = new FormData()
    fd.append('file', file)

    const blob = await this.http.request<Blob>('/users/ocr/pdf', {
      method: 'POST',
      body: fd,
    })
    return blob
  }
}

export const api = new CockApi()
