import type { Role } from '../../types'
const labels: Record<Role, string> = { ADMIN: 'Admin', TEACHER: 'Enseignant', STUDENT: 'Étudiant', STAFF: 'Personnel' }
export function RoleBadge({ role }: { role: Role }) { return <span className={`role-tag role-${role.toLowerCase()}`}>{labels[role]}</span> }
