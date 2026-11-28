import { useRef, useState, type FormEvent } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Avatar } from "../../components/common/Avatar";
import { ModalPortal } from "../../components/common/ModalPortal";
import { useAuth } from "../../hooks/useAuth";
import { patch, remove, upload } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import type { User } from "../../types";
import { errorMessage } from "../../utils/format";

const roles: Record<string, string> = {
  ADMIN: "Administrateur",
  TEACHER: "Enseignant",
  STUDENT: "Étudiant",
  STAFF: "Personnel administratif",
};
function PasswordField({
  label,
  value,
  onChange,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="form-control">
      <span>{label}</span>
      <div className="password-field">
        <input
          required
          minLength={minLength}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={
            visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          onClick={() => setVisible((state) => !state)}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const askConfirm = useConfirm();
  const input = useRef<HTMLInputElement>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [old, setOld] = useState("");
  const [next, setNext] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirmValue)
      return toast("La confirmation ne correspond pas.", "error");
    if (!(await askConfirm("Confirmer la modification du mot de passe ?")))
      return;
    setBusy(true);
    try {
      await patch("/users/me/password", {
        currentPassword: old,
        newPassword: next,
      });
      setPasswordOpen(false);
      setOld("");
      setNext("");
      setConfirmValue("");
      toast("Mot de passe modifié avec succès.");
    } catch (x) {
      toast(errorMessage(x), "error");
    } finally {
      setBusy(false);
    }
  }
  async function changePhoto(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      updateUser(await upload<User>("/users/me/profile-photo", file));
      setPhotoOpen(false);
      toast("Photo de profil mise à jour.");
    } catch (x) {
      toast(errorMessage(x), "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  async function deletePhoto() {
    if (
      !(await askConfirm("Supprimer votre photo de profil ?", {
        destructive: true,
        confirmLabel: "Supprimer",
      }))
    )
      return;
    setBusy(true);
    try {
      updateUser(await remove<User>("/users/me/profile-photo"));
      toast("Photo de profil supprimée.");
      setPhotoOpen(false);
    } catch (x) {
      toast(errorMessage(x), "error");
    } finally {
      setBusy(false);
    }
  }
  const photoAction = user?.profilePhotoUrl
    ? "Modifier la photo"
    : "Ajouter une photo";
  return (
    <div className="profile-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ESPACE PERSONNEL</span>
          <h1>Mon profil</h1>
        </div>
        <button
          className="button button-primary"
          onClick={() => setPasswordOpen(true)}
        >
          <LockKeyhole size={16} />
          Modifier le mot de passe
        </button>
      </div>
      <section className="profile-sheet">
        <div className="profile-hero">
          <button
            className="profile-avatar-button"
            type="button"
            onClick={() => setPhotoOpen(true)}
            title="Gérer la photo de profil"
          >
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              photoUrl={user?.profilePhotoUrl}
              size="large"
            />
            <span>
              <Camera size={15} />
            </span>
          </button>
          <div>
            <h2>
              {user?.firstName} {user?.lastName}
            </h2>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="profile-fields">
          <div>
            <span>
              <UserRound size={16} />
              Rôle
            </span>
            <strong>{roles[user?.role || ""]}</strong>
          </div>
          <div>
            <span>
              <ShieldCheck size={16} />
              Rattachement
            </span>
            <strong>
              {user?.studentNumber ||
                user?.teacherPosition ||
                user?.staffPosition ||
                "ENI"}
            </strong>
          </div>
        </div>
      </section>
      {photoOpen && (
        <ModalPortal>
          <div
            className="drawer-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPhotoOpen(false);
            }}
          >
            <section
              className="profile-sheet profile-photo-modal"
              role="dialog"
              aria-modal="true"
            >
              <button
                className="icon-button"
                onClick={() => setPhotoOpen(false)}
              >
                <X size={18} />
              </button>
              <h2>Photo de profil</h2>
              <div className="profile-photo-preview">
                <Avatar
                  firstName={user?.firstName}
                  lastName={user?.lastName}
                  photoUrl={user?.profilePhotoUrl}
                  size="large"
                />
              </div>
              <input
                ref={input}
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => void changePhoto(e.target.files?.[0])}
              />
              <div
                className={`profile-photo-modal-actions ${user?.profilePhotoUrl ? "has-photo" : ""}`}
              >
                <button
                  className="button button-quiet"
                  type="button"
                  onClick={() => setPhotoOpen(false)}
                >
                  Annuler
                </button>
                <button
                  className="button button-primary"
                  disabled={busy}
                  onClick={() => input.current?.click()}
                >
                  <Camera size={16} />
                  {photoAction}
                </button>
                {user?.profilePhotoUrl && (
                  <button
                    className="button button-danger"
                    disabled={busy}
                    onClick={() => void deletePhoto()}
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                )}
              </div>
            </section>
          </div>
        </ModalPortal>
      )}
      {passwordOpen && (
        <ModalPortal>
          <div
            className="drawer-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPasswordOpen(false);
            }}
          >
            <section className="profile-sheet" role="dialog" aria-modal="true">
              <button
                className="icon-button"
                onClick={() => setPasswordOpen(false)}
              >
                <X size={18} />
              </button>
              <h2>Modifier mon mot de passe</h2>
              <form
                className="admin-user-form"
                onSubmit={(e) => void submit(e)}
              >
                <PasswordField
                  label="Mot de passe actuel"
                  value={old}
                  onChange={setOld}
                />
                <PasswordField
                  label="Nouveau mot de passe"
                  value={next}
                  onChange={setNext}
                  minLength={10}
                />
                <PasswordField
                  label="Confirmation"
                  value={confirmValue}
                  onChange={setConfirmValue}
                  minLength={10}
                />
                <div className="modal-actions">
                  <button
                    className="button button-quiet"
                    type="button"
                    onClick={() => setPasswordOpen(false)}
                  >
                    Annuler
                  </button>
                  <button className="button button-primary" disabled={busy}>
                    {busy ? "Mise à jour…" : "Confirmer"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
