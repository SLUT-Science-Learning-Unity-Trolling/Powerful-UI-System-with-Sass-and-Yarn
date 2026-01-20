import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from 'shared/api/client'

type AuthStatus = 'unknown' | 'authed' | 'guest'

type AuthContextValue = {
  status: AuthStatus
  isAuthed: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('unknown')

  const refresh = useCallback(async () => {
    try {
      const me = await api.me()
      setStatus(me?.success === true ? 'authed' : 'guest')
    } catch {
      setStatus('guest')
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthed: status === 'authed',
      refresh,
    }),
    [status, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider />')
  return ctx
}
