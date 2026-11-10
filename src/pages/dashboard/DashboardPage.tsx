import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, Clock3, FileText, Inbox, MailPlus, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../components/common/Avatar'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../hooks/useAuth'
import { get } from '../../services/api'
import type { MailMessage } from '../../types'
import { errorMessage, formatDate } from '../../utils/format'

export function DashboardPage() {
  const { user } = useAuth()
  const [inbox, setInbox] = useState<MailMessage[]>([])
  const [sent, setSent] = useState<MailMessage[]>([])
  const [drafts, setDrafts] = useState<MailMessage[]>([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let active = true
    Promise.all([get<MailMessage[]>('/messages/inbox'), get<MailMessage[]>('/messages/sent'), get<MailMessage[]>('/messages/drafts')])
      .then(([received, outgoing, saved]) => { if (active) { setInbox(received); setSent(outgoing); setDrafts(saved) } })
      .catch((failure) => { if (active) setError(errorMessage(failure)) })
      .finally(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [])
  const unread = inbox.filter((message) => !message.read).length
  return <div className="dashboard-page"><div className="welcome-band"><div><span className="eyebrow">VOTRE ESPACE ENI</span><h1>Bonjour, {user?.firstName}.</h1><p>Voici le point sur votre messagerie aujourd’hui.</p></div><Link to="/compose" className="button button-primary"><MailPlus size={17} />Écrire un message</Link><span className="welcome-index">ENI / 01</span></div>
    {error && <div className="inline-error" role="alert">{error}</div>}
    <div className="stats-row"><Link to="/inbox" className="stat-block stat-highlight"><span className="stat-icon"><Inbox size={18} /></span><span className="stat-label">À traiter</span><strong>{loaded ? unread : '—'}</strong><span className="stat-note">messages non lus <ArrowUpRight size={14} /></span></Link><Link to="/sent" className="stat-block"><span className="stat-icon stat-icon-coral"><Send size={18} /></span><span className="stat-label">Envoyés</span><strong>{loaded ? sent.length : '—'}</strong><span className="stat-note">messages au total <ArrowUpRight size={14} /></span></Link><Link to="/drafts" className="stat-block"><span className="stat-icon stat-icon-gold"><FileText size={18} /></span><span className="stat-label">Brouillons</span><strong>{loaded ? drafts.length : '—'}</strong><span className="stat-note">à reprendre <ArrowUpRight size={14} /></span></Link></div>
    <div className="dashboard-grid"><section className="section-panel recent-panel"><div className="section-heading"><div><span className="eyebrow">VOTRE ACTIVITÉ</span><h2>Messages récents</h2></div><Link to="/inbox" className="subtle-link">Tout voir <ArrowRight size={15} /></Link></div>{!loaded ? <div className="loading-lines"><span /><span /><span /></div> : inbox.slice(0, 5).length ? <div className="recent-list">{inbox.slice(0, 5).map((message) => <Link to="/inbox" key={message.id} className={`recent-item ${message.read ? '' : 'recent-unread'}`}><Avatar firstName={message.senderName.split(' ')[0]} lastName={message.senderName.split(' ').slice(1).join(' ')} size="small" /><div className="recent-copy"><strong>{message.senderName}</strong><span>{message.subject || '(Sans objet)'}</span><small>{message.body.slice(0, 88)}</small></div><span className="recent-date"><Clock3 size={13} />{formatDate(message.sentAt)}</span></Link>)}</div> : <EmptyState icon={<Inbox size={22} />} title="Votre boîte est vide" detail="Les nouveaux messages apparaîtront ici." />}</section>
      <aside className="section-panel account-panel"><span className="eyebrow">MON ESPACE</span><div className="account-avatar"><Avatar firstName={user?.firstName} lastName={user?.lastName} size="large" /></div><h2>{user?.firstName} {user?.lastName}</h2><p>{user?.email}</p><div className="account-divider" /><dl><div><dt>Rôle</dt><dd>{user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'TEACHER' ? 'Enseignant' : 'Étudiant'}</dd></div><div><dt>Département</dt><dd>{user?.department || 'Non renseigné'}</dd></div><div><dt>Promotion</dt><dd>{user?.promotion || 'Non renseignée'}</dd></div></dl><Link to="/profile" className="subtle-link profile-link">Voir mon profil <ArrowRight size={15} /></Link></aside></div>
  </div>
}