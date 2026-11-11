import { useEffect, useState } from 'react'
import { ContactRound, Search, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/common/Avatar'
import { EmptyState } from '../../components/common/EmptyState'
import { RoleBadge } from '../../components/admin/RoleBadge'
import { get } from '../../services/api'
import type { User } from '../../types'
import { errorMessage } from '../../utils/format'

export function ContactsPage() {
  const navigate = useNavigate(); const [contacts, setContacts] = useState<User[]>([]); const [search, setSearch] = useState(''); const [error, setError] = useState('')
  useEffect(() => { get<User[]>(`/users${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`).then(setContacts).catch((e) => setError(errorMessage(e))) }, [search])
  return <div className="directory-page"><div className="page-heading"><div><span className="eyebrow">ANNUAIRE ENI</span><h1>Contacts</h1><p>Recherchez un membre par nom ou numéro matricule.</p></div></div><div className="directory-toolbar"><label className="directory-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, prénom ou matricule" /></label></div>{error && <div className="inline-error">{error}</div>}{contacts.length ? <div className="contact-grid">{contacts.map((c) => <article className="contact-entry" key={c.id}><Avatar firstName={c.firstName} lastName={c.lastName} photoUrl={c.profilePhotoUrl} /><div className="contact-info"><strong>{c.firstName} {c.lastName}</strong><a href={`mailto:${c.email}`}>{c.email}</a>{c.studentNumber && <span>Matricule : {c.studentNumber}</span>}</div><RoleBadge role={c.role} /><button className="icon-button" title="Écrire un message" onClick={() => navigate('/compose', { state: { recipients: [c.email] } })}><Send size={16} /></button></article>)}</div> : <EmptyState icon={<ContactRound size={22} />} title="Aucun contact trouvé" detail="Essayez un autre nom ou matricule." />}</div>
}
