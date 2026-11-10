import { useContext } from 'react'
import { ToastContext } from '../contexts/toast-context'

export function useToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast doit être utilisé dans ToastProvider')
  return show
}