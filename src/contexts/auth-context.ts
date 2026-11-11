import { createContext } from 'react'
import type { User } from '../types'

export interface AuthContextValue { user: User | null; login: (email: string, password: string) => Promise<void>; logout: () => void; updateUser: (user: User) => void }
export const AuthContext = createContext<AuthContextValue | null>(null)
