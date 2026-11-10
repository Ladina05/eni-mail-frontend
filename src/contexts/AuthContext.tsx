import { useEffect, useState, type ReactNode } from 'react'
import { post } from '../services/api'
import type { AuthResponse, User } from '../types'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('eni-mail-user') ?? 'null') as User | null } catch { return null }
  })
  useEffect(() => {
    const clearSession = () => setUser(null)
    window.addEventListener('eni-mail:unauthorized', clearSession)
    return () => window.removeEventListener('eni-mail:unauthorized', clearSession)
  }, [])
  async function login(email: string, password: string) {
    const result = await post<AuthResponse>('/auth/login', { email, password })
    localStorage.setItem('eni-mail-token', result.token)
    localStorage.setItem('eni-mail-user', JSON.stringify(result.user))
    setUser(result.user)
  }
  function logout() {
    localStorage.removeItem('eni-mail-token')
    localStorage.removeItem('eni-mail-user')
    setUser(null)
  }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}