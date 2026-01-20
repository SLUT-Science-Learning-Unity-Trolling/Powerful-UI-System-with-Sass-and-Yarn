import { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'

interface RouterProviderProps {
  children: ReactNode
}

export const RouterProvider = ({ children }: RouterProviderProps) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
)
