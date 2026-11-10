import { createContext } from 'react'

export type ToastTone = 'success' | 'error'
export const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null)