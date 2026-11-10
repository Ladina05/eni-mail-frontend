import { useState, type ReactNode } from 'react'
import { Check, CircleAlert, X } from 'lucide-react'
import { ToastContext } from './toast-context'

type Tone = 'success' | 'error'
interface Toast { id: number; message: string; tone: Tone }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  function show(message: string, tone: Tone = 'success') {
    const id = Date.now() + Math.random()
    setItems((current) => [...current, { id, message, tone }])
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4000)
  }
  return <ToastContext.Provider value={show}>{children}<div className="toast-stack" aria-live="polite">{items.map((item) => <div className={`toast toast-${item.tone}`} key={item.id}>{item.tone === 'success' ? <Check size={17} /> : <CircleAlert size={17} />}<span>{item.message}</span><button className="icon-button" type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Fermer"><X size={15} /></button></div>)}</div></ToastContext.Provider>
}