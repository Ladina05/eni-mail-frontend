import { initials } from '../../utils/format'
import { apiUrl } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export function Avatar({ firstName, lastName, photoUrl, size = 'regular' }: { firstName?: string; lastName?: string; photoUrl?: string | null; size?: 'regular' | 'small' | 'large' }) {
  const { user } = useAuth()
  const ownPhoto = user && user.firstName === firstName && user.lastName === lastName ? user.profilePhotoUrl : null
  const source = photoUrl ?? ownPhoto
  return <span className={`avatar avatar-${size}`} aria-hidden="true">{source ? <img src={apiUrl(source)} alt="" /> : initials(firstName, lastName)}</span>
}
