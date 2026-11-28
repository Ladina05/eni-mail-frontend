import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { post } from "../../services/api";
import { errorMessage } from "../../utils/format";

function PasswordInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-with-icon password-input">
        <LockKeyhole size={17} />
        <input
          id={id}
          required
          minLength={10}
          autoComplete="new-password"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setVisible((state) => !state)}
          aria-label={
            visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </>
  );
}
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }
    post<{ valid: boolean }>("/auth/validate-reset-token", { token })
      .then((result) => setValid(result.valid))
      .catch(() => setValid(false))
      .finally(() => setValidating(false));
  }, [token]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation)
      return setError("La confirmation du mot de passe ne correspond pas.");
    setBusy(true);
    setError("");
    try {
      const result = await post<{ message: string }>("/auth/reset-password", {
        token,
        newPassword: password,
        confirmation,
      });
      setSuccess(result.message);
      setValid(false);
    } catch (e) {
      setError(errorMessage(e));
      setValid(false);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-screen">
      <section className="login-left">
        <div className="login-brand">
          <span className="brand-symbol" />
          <span className="brand-name">
            eni<span>mail</span>
          </span>
        </div>
        <div className="login-copy">
          <span className="eyebrow">SÉCURITÉ DU COMPTE</span>
          <h1>
            Choisissez un
            <br />
            <em>nouveau mot de passe.</em>
          </h1>
          <p>
            Votre lien est valide pendant 15 minutes et ne peut être utilisé
            qu’une seule fois.
          </p>
        </div>
        <div className="login-foot">
          <span>ÉCOLE NATIONALE D’INFORMATIQUE</span>
          <span>Fianarantsoa · Madagascar</span>
        </div>
      </section>
      <section className="login-right">
        <div className="login-topline">
          <Link to="/login" className="help-link">
            <ArrowLeft size={14} />
            Connexion
          </Link>
        </div>
        <form className="login-form" onSubmit={(e) => void submit(e)}>
          <div className="login-title">
            <span className="eyebrow">NOUVEAU MOT DE PASSE</span>
            <h2>Réinitialisation</h2>
            <p>
              {validating
                ? "Vérification du lien…"
                : valid
                  ? "Choisissez un mot de passe de 10 caractères minimum."
                  : "Ce lien est invalide, expiré ou déjà utilisé."}
            </p>
          </div>
          {!validating && valid && (
            <>
              <PasswordInput
                id="new-password"
                label="Nouveau mot de passe"
                value={password}
                onChange={setPassword}
              />
              <PasswordInput
                id="confirm-password"
                label="Confirmation"
                value={confirmation}
                onChange={setConfirmation}
              />
            </>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="form-success" role="status">
              {success} <Link to="/login">Se connecter</Link>
            </div>
          )}
          {valid && (
            <button
              className="button button-primary login-submit"
              disabled={busy}
            >
              {busy ? "Réinitialisation…" : "Enregistrer le mot de passe"}
              <ArrowRight size={17} />
            </button>
          )}
          {!validating && !valid && !success && (
            <Link
              className="button button-primary login-submit"
              to="/forgot-password"
            >
              Demander un nouveau lien <ArrowRight size={17} />
            </Link>
          )}
        </form>
        <div className="login-bottom">
          © {new Date().getFullYear()} ENI · Tous droits réservés
        </div>
      </section>
    </main>
  );
}
