export function initials(firstName = '', lastName = '') { return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || 'EN' }
export function formatDate(value: string | null, full = false) {
  if (!value) return 'Brouillon'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const sameDay = new Date().toDateString() === date.toDateString()
  return new Intl.DateTimeFormat('fr-FR', full ? { dateStyle: 'medium', timeStyle: 'short' } : sameDay ? { hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short' }).format(date)
}
export function parseEmails(value: string) { return value.split(/[;,\n]/).map((email) => email.trim()).filter(Boolean) }
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.' }