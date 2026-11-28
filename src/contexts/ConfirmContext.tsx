import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { ModalPortal } from '../components/common/ModalPortal'
import { ConfirmContext } from './confirm-context'

type ConfirmOptions = { title?: string; confirmLabel?: string; destructive?: boolean }
type Request = { message: string; options: ConfirmOptions }

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const finish = useCallback((accepted: boolean) => {
    resolveRef.current?.(accepted)
    resolveRef.current = null
    setRequest(null)
  }, [])

  const confirm = useCallback((message: string, options: ConfirmOptions = {}) => new Promise<boolean>((resolve) => {
    resolveRef.current = resolve
    setRequest({ message, options })
  }), [])

  useEffect(() => {
    if (!request) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [finish, request])

  return <ConfirmContext.Provider value={confirm}>{children}{request && <ModalPortal><div className="confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) finish(false) }}>
    <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
      <button className="icon-button confirm-close" type="button" aria-label="Fermer" onClick={() => finish(false)}><X size={17} /></button>
      <span className={`confirm-icon ${request.options.destructive ? 'confirm-icon-danger' : ''}`}><AlertTriangle size={21} /></span>
      <h2 id="confirm-title">{request.options.title ?? 'Confirmer cette action'}</h2>
      <p id="confirm-message">{request.message}</p>
      <div className="confirm-actions"><button className="button button-quiet" type="button" onClick={() => finish(false)}>Annuler</button><button className={`button ${request.options.destructive ? 'button-danger' : 'button-primary'}`} type="button" autoFocus onClick={() => finish(true)}>{request.options.confirmLabel ?? 'Confirmer'}</button></div>
    </section>
  </div></ModalPortal>}</ConfirmContext.Provider>
}
