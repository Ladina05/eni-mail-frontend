import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Archive, Bell, Check, ChevronDown, ContactRound, FileText, Inbox, LayoutDashboard, LogOut, Mail, Menu, Plus, Send, Settings2, ShieldCheck, Trash2, Users, X } from 'lucide-react'
import { Avatar } from '../common/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { get } from '../../services/api'
import { patch } from '../../services/api'
import type { NotificationItem } from '../../types'
import { formatDate } from '../../utils/format'

const links = [
  { to: '/', label: 'Vue générale', Icon: LayoutDashboard, end: true },
  { to: '/inbox', label: 'Boîte de réception', Icon: Inbox },
  { to: '/sent', label: 'Messages envoyés', Icon: Send },
  { to: '/drafts', label: 'Brouillons', Icon: FileText },
]
const labels: Record<string, string> = { '/': 'Vue générale', '/inbox': 'Boîte de réception', '/sent': 'Messages envoyés', '/drafts': 'Brouillons', '/archive': 'Archives', '/trash': 'Corbeille', '/contacts': 'Annuaire', '/groups': 'Groupes', '/profile': 'Mon profil', '/admin': 'Administration', '/compose': 'Nouveau message' }

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const name = user ? `${user.firstName} ${user.lastName}` : 'Membre'
  useEffect(() => {
    let active = true
    const update = () => get<{ count: number }>('/notifications/unread-count').then((result) => { if (active) setUnread(result.count) }).catch(() => undefined)
    void update()
    const timer = window.setInterval(() => void update(), 60_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])
  function signOut() { logout(); navigate('/login', { replace: true }) }
  async function toggleNotifications() {
    const opening = !notificationsOpen
    setNotificationsOpen(opening)
    if (opening) {
      try { setNotifications(await get<NotificationItem[]>('/notifications')) }
      catch { setNotifications([]) }
    }
  }
  async function markNotificationRead(notification: NotificationItem) {
    if (notification.read) return
    try {
      await patch(`/notifications/${notification.id}/read`)
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item))
      setUnread((count) => Math.max(0, count - 1))
    } catch { /* The unread count refreshes on its regular interval. */ }
  }
  return <div className="app-frame">
    {menuOpen && <button className="sidebar-scrim" type="button" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><Link to="/" className="brand-mark"><span className="brand-symbol"><Mail size={20} /></span><span className="brand-name">eni<span>mail</span></span></Link><button className="icon-button mobile-close" type="button" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <Link to="/compose" className="compose-link" onClick={() => setMenuOpen(false)}><Plus size={18} />Nouveau message</Link>
      <div className="nav-section-label">ESPACE MAIL</div><nav className="main-nav">{links.map(({ to, label, Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Icon size={18} /><span>{label}</span>{to === '/inbox' && unread > 0 && <span className="nav-count">{unread > 99 ? '99+' : unread}</span>}</NavLink>)}</nav>
      <div className="nav-section-label nav-label-spaced">CLASSEMENT</div><nav className="main-nav"><NavLink to="/archive" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Archive size={18} /><span>Archives</span></NavLink><NavLink to="/trash" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Trash2 size={18} /><span>Corbeille</span></NavLink></nav>
      <div className="nav-section-label nav-label-spaced">ANNUAIRE</div><nav className="main-nav"><NavLink to="/contacts" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><ContactRound size={18} /><span>Contacts</span></NavLink><NavLink to="/groups" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Users size={18} /><span>Groupes</span></NavLink></nav>
      {user?.role === 'ADMIN' && <><div className="nav-section-label nav-label-spaced">GESTION</div><nav className="main-nav"><NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><ShieldCheck size={18} /><span>Administration</span></NavLink></nav></>}
      <div className="sidebar-bottom"><Link to="/profile" onClick={() => setMenuOpen(false)} className="profile-mini"><Avatar firstName={user?.firstName} lastName={user?.lastName} size="small" /><span className="profile-mini-copy"><strong>{name}</strong><small>{user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'TEACHER' ? 'Enseignant' : 'Étudiant'}</small></span><ChevronDown size={15} /></Link><button type="button" className="signout-link" onClick={signOut}><LogOut size={16} />Se déconnecter</button></div>
    </aside>
    <main className="workspace"><header className="topbar"><button className="icon-button mobile-menu" type="button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>ENI Mail</span><span>/</span><strong>{labels[location.pathname] ?? 'Messagerie'}</strong></div><div className="topbar-actions"><div className="notification-wrap"><button className="icon-button notification-button" type="button" onClick={() => void toggleNotifications()} aria-label="Notifications" aria-expanded={notificationsOpen}><Bell size={17} />{unread > 0 && <span className="notification-dot" />}</button>{notificationsOpen && <div className="notification-popover"><div className="notification-heading"><strong>Notifications</strong><button className="icon-button" type="button" aria-label="Fermer les notifications" onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div>{notifications.length ? notifications.map((item) => <button type="button" className={`notification-item ${item.read ? '' : 'notification-unread'}`} key={item.id} onClick={() => void markNotificationRead(item)}><span className="notification-mark">{item.read ? <Check size={14} /> : <Mail size={14} />}</span><span className="notification-copy"><strong>{item.title}</strong><span>{item.content}</span><small>{formatDate(item.createdAt, true)}</small></span></button>) : <p className="notification-empty">Aucune notification.</p>}</div>}</div><Link className="topbar-profile" to="/profile"><Avatar firstName={user?.firstName} lastName={user?.lastName} size="small" /><span>{name}</span></Link><button className="topbar-settings icon-button" type="button" onClick={() => navigate('/profile')} aria-label="Paramètres du profil"><Settings2 size={17} /></button></div></header><section className="page-content"><Outlet /></section></main>
  </div>
}