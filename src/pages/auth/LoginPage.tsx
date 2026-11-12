
import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, MoveUpRight } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { errorMessage } from '../../utils/format'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-left">
        <div className="login-brand">
          <img
            src="/logo.png"
            alt="Logo ENI"
            className="brand-logo"
          />
          <span className="brand-name">
            eni<span>mail</span>
          </span>
        </div>

        <div className="login-copy">
          <span className="eyebrow">MESSAGERIE INSTITUTIONNELLE</span>
          <h1>
            Les échanges<br />
            qui font avancer<br />
            <em>l’ENI.</em>
          </h1>
          <p>
            Un espace de communication simple et sécurisé pour la communauté
            de l’École Nationale d’Informatique.
          </p>
        </div>

        <div className="login-foot">
          <span>ÉCOLE NATIONALE D’INFORMATIQUE</span>
          <span>Fianarantsoa · Madagascar</span>
        </div>

        <div className="login-orbit orbit-one" />
        <div className="login-orbit orbit-two" />
      </section>

      <section className="login-right">
        <div className="login-topline">
          <span>Accès membre</span>
          <Link to="/login" className="help-link">
            Aide <MoveUpRight size={14} />
          </Link>
        </div>

        <form
          className="login-form"
          onSubmit={(event) => void submit(event)}
        >
          <div className="login-title">
            <span className="eyebrow">BONJOUR</span>
            <h2>Connectez-vous</h2>
            <p>
              Entrez vos identifiants institutionnels pour continuer.
            </p>
          </div>

          <label className="field-label" htmlFor="email">
            Adresse e-mail
          </label>

          <div className="input-with-icon">
            <Mail size={17} />
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nom@eni.mg"
            />
          </div>

          <label className="field-label" htmlFor="password">
            Mot de passe
          </label>

          <div className="input-with-icon password-input">
            <LockKeyhole size={17} />
            <input
              id="password"
              type={visible ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Votre mot de passe"
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={
                visible
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              }
              onClick={() => setVisible((value) => !value)}
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="button button-primary login-submit"
            type="submit"
            disabled={busy}
          >
            {busy ? 'Connexion…' : 'Se connecter'}
            <ArrowRight size={17} />
          </button>

          <p className="login-security">
            <LockKeyhole size={14} />
            Connexion protégée par votre compte ENI
          </p>
        </form>

        <div className="login-bottom">
          © {new Date().getFullYear()} ENI · Tous droits réservés · Izy M'Lay Dev
        </div>
      </section>
    </main>
  )
}
