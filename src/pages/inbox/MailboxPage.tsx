import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Archive, ArrowDown, ArrowUp, FileText, Inbox, Mail, Search, Send, Star, Trash2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { IconButton } from '../../components/common/IconButton'
import { MessageDrawer } from '../../components/email/MessageDrawer'
import { useToast } from '../../hooks/useToast'
import { get, patch, remove } from '../../services/api'
import type { MailFolder, MailMessage } from '../../types'
import { errorMessage, formatDate } from '../../utils/format'

const meta: Record<MailFolder, { title: string; caption: string; icon: typeof Inbox; endpoint: string }> = {
  inbox: { title: 'Boîte de réception', caption: 'ESPACE MAIL / RÉCEPTION', icon: Inbox, endpoint: '/messages/inbox' },
  sent: { title: 'Messages envoyés', caption: 'ESPACE MAIL / ENVOYÉS', icon: Send, endpoint: '/messages/sent' },
  drafts: { title: 'Brouillons', caption: 'ESPACE MAIL / BROUILLONS', icon: FileText, endpoint: '/messages/drafts' },
  archive: { title: 'Archives', caption: 'CLASSEMENT / ARCHIVES', icon: Archive, endpoint: '/messages/archive' },
  trash: { title: 'Corbeille', caption: 'CLASSEMENT / CORBEILLE', icon: Trash2, endpoint: '/messages/trash' },
}

export function MailboxPage({ folder }: { folder: MailFolder }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const showToast = useToast()
  const info = meta[folder]
  const Icon = info.icon
  const [messages, setMessages] = useState<MailMessage[]>([])
  const [selected, setSelected] = useState<{ folder: MailFolder; message: MailMessage } | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function load() {
    setError('')
    try { setMessages(await get<MailMessage[]>(info.endpoint)) }
    catch (failure) { setError(errorMessage(failure)) }
  }
  useEffect(() => {
    let active = true
    get<MailMessage[]>(info.endpoint).then((result) => { if (active) { setMessages(result); setError('') } }).catch((failure) => { if (active) setError(errorMessage(failure)) })
    return () => { active = false }
  }, [info.endpoint])
  useEffect(() => {
    const id = searchParams.get('message')
    if (!id || folder !== 'inbox') return
    get<MailMessage>(`/messages/${id}`).then((message) => { setSelected({ folder, message }); window.dispatchEvent(new Event('eni-mail:unread-changed')); setSearchParams({}) }).catch(() => setSearchParams({}))
  }, [folder, searchParams, setSearchParams])
  const filtered = useMemo(() => messages.filter((message) => `${message.subject} ${message.body} ${message.senderName} ${message.senderEmail}`.toLowerCase().includes(query.toLowerCase())), [messages, query])
  async function toggleStar(event: MouseEvent, message: MailMessage) {
    event.stopPropagation()
    try { await patch(`/messages/${message.id}/star`); setMessages((items) => items.map((item) => item.id === message.id ? { ...item, starred: !item.starred } : item)) }
    catch (failure) { showToast(errorMessage(failure), 'error') }
  }
  async function deleteDraft(event: MouseEvent, message: MailMessage) {
    event.stopPropagation()
    if (!window.confirm('Supprimer définitivement ce brouillon ?')) return
    try { await remove(`/messages/drafts/${message.id}`); setMessages((items) => items.filter((item) => item.id !== message.id)); showToast('Brouillon supprimé.') }
    catch (failure) { showToast(errorMessage(failure), 'error') }
  }
  function openMessage(message: MailMessage) {
    if (folder === 'drafts') navigate('/compose', { state: { draft: message } })
    else get<MailMessage>(`/messages/${message.id}`).then((detail) => { setSelected({ folder, message: detail }); window.dispatchEvent(new Event('eni-mail:unread-changed')) }).catch((failure) => showToast(errorMessage(failure), 'error'))
  }
  async function quickAction(event: MouseEvent, message: MailMessage, action: string) {
    event.stopPropagation(); setBusy(true)
    try { await patch(`/messages/${message.id}/${action}`); await load(); showToast(action === 'restore' ? 'Message restauré.' : 'État du message mis à jour.') }
    catch (failure) { showToast(errorMessage(failure), 'error') }
    finally { setBusy(false) }
  }
  async function permanentlyDelete(event: MouseEvent, message: MailMessage) {
    event.stopPropagation()
    if (!window.confirm('Supprimer définitivement ce message de votre corbeille ?')) return
    try { await remove(`/messages/${message.id}/permanent`); await load(); showToast('Message supprimé définitivement.') }
    catch (failure) { showToast(errorMessage(failure), 'error') }
  }
  async function emptyTrash() {
    if (!window.confirm('Vider définitivement votre corbeille ?')) return
    try { await remove('/messages/trash'); await load(); showToast('Corbeille vidée.') }
    catch (failure) { showToast(errorMessage(failure), 'error') }
  }
  return <div className="mailbox-page"><div className="page-heading"><div><span className="eyebrow">{info.caption}</span><h1>{info.title}</h1><p>{folder === 'inbox' ? 'Vos échanges et annonces de la communauté ENI.' : 'Retrouvez et gérez vos messages.'}</p></div>{folder === 'trash' ? <button className="button button-quiet" type="button" onClick={() => void emptyTrash()}>Vider la corbeille</button> : ['inbox', 'sent', 'drafts'].includes(folder) && <button className="button button-primary" type="button" onClick={() => navigate('/compose')}><Mail size={16} />Nouveau message</button>}</div>
    {error && <div className="inline-error" role="alert">{error}<button className="text-button" type="button" onClick={() => void load()}>Réessayer</button></div>}
    <section className="mail-list-panel"><div className="mail-list-toolbar"><div className="mailbox-label"><Icon size={17} /><span>{messages.length} {messages.length === 1 ? 'message' : 'messages'}</span></div><label className="mail-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans cette liste" /></label><button className="button button-quiet refresh-button" type="button" onClick={() => void load()}>Actualiser</button></div>{busy && <div className="inline-loading">Mise à jour…</div>}
    {!error && filtered.length === 0 ? <EmptyState icon={<Icon size={23} />} title={query ? 'Aucun résultat' : `Aucun ${folder === 'drafts' ? 'brouillon' : 'message'}`} detail={query ? 'Essayez un autre terme de recherche.' : 'Cette liste est vide pour le moment.'} /> : <div className="mail-rows" role="list">{filtered.map((message) => <div key={message.id} role="listitem" tabIndex={0} className={`mail-row ${!message.read && folder === 'inbox' ? 'mail-unread' : ''}`} onClick={() => openMessage(message)} onKeyDown={(event) => { if (event.key === 'Enter') openMessage(message) }}><div className="mail-row-status">{!message.read && folder === 'inbox' && <span className="unread-dot" />}</div><div className="mail-row-main"><div className="mail-sender">{folder === 'sent' ? 'Moi' : message.senderName}<span className="mail-email">{folder === 'sent' ? message.senderEmail : ` · ${message.senderEmail}`}</span></div><div className="mail-subject-line"><strong>{message.subject || '(Sans objet)'}</strong><span> — {message.body.replace(/\s+/g, ' ').slice(0, 130)}</span></div></div><div className="mail-row-tail"><span className="mail-date">{formatDate(message.sentAt)}</span><div className="row-actions"><IconButton label={message.starred ? 'Retirer des favoris' : 'Ajouter aux favoris'} active={message.starred} onClick={(event) => void toggleStar(event, message)}><Star size={16} /></IconButton>{folder === 'drafts' ? <IconButton label="Supprimer le brouillon" onClick={(event) => void deleteDraft(event, message)}><Trash2 size={16} /></IconButton> : folder === 'archive' || folder === 'trash' ? <><IconButton label="Restaurer" onClick={(event) => void quickAction(event, message, 'restore')}><ArrowUp size={16} /></IconButton>{folder === 'trash' && <IconButton label="Supprimer définitivement" onClick={(event) => void permanentlyDelete(event, message)}><Trash2 size={16} /></IconButton>}</> : <IconButton label={message.read ? 'Marquer comme non lu' : 'Marquer comme lu'} onClick={(event) => void quickAction(event, message, message.read ? 'unread' : 'read')}><ArrowDown size={16} /></IconButton>}</div></div></div>)}</div>}</section>
    {selected?.folder === folder && <MessageDrawer message={selected.message} folder={folder} onClose={() => setSelected(null)} onChanged={() => void load()} />}
  </div>
}
