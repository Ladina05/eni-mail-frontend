import { useContext } from 'react'
import { ConfirmContext } from '../contexts/confirm-context'

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm doit être utilisé dans ConfirmProvider')
  return confirm
}
