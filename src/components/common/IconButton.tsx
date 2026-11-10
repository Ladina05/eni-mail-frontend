import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function IconButton({ label, children, active = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode; active?: boolean }) {
  return <button type="button" className={`icon-button ${active ? 'is-active' : ''}`} aria-label={label} title={label} {...props}>{children}</button>
}