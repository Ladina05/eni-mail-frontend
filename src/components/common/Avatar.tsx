import { initials } from '../../utils/format'

export function Avatar({ firstName, lastName, size = 'regular' }: { firstName?: string; lastName?: string; size?: 'regular' | 'small' | 'large' }) {
  return <span className={`avatar avatar-${size}`} aria-hidden="true">{initials(firstName, lastName)}</span>
}