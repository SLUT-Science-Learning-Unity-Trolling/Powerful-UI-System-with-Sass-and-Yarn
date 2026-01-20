import { ApiError, AuthRequiredError } from './errors'
import type { CockApi } from './client'

export class AuthManager {
  private api: CockApi
  private ttlMs: number
  private cached: { ok: boolean; at: number } | null = null

  constructor(api: CockApi, ttlMs = 30_000) {
    this.api = api
    this.ttlMs = ttlMs
  }

  invalidate() {
    this.cached = null
  }

  private isFresh() {
    if (!this.cached) return false
    return Date.now() - this.cached.at < this.ttlMs
  }

  async isAuthenticated(): Promise<boolean> {
    if (this.isFresh()) return this.cached!.ok

    try {
      await this.api.me()
      this.cached = { ok: true, at: Date.now() }
      return true
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        this.cached = { ok: false, at: Date.now() }
        return false
      }
      throw e
    }
  }

  async requireAuth(): Promise<void> {
    const ok = await this.isAuthenticated()
    if (!ok) throw new AuthRequiredError('Требуется авторизация')
  }
}
