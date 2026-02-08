import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import Input from "../ui/input";
import Button from "../ui/button";
import ConfirmModal from "../ui/confirmModal";
import {
  updateMyProfile,
  updateMyAvatar,
  deleteMyAccount,
  changeMyPassword,
} from "../../api/user";

const MAX_AVATAR_SIZE_MB = 2;
const MAX_AVATAR_SIZE_BYTES =
  MAX_AVATAR_SIZE_MB * 1024 * 1024;

const SetProfile = () => {
  const user = useAuthStore((s) => s.user);
  const checkingAuth = useAuthStore((s) => s.checkingAuth);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const addToast = useToastStore((s) => s.addToast);

  const [formValues, setFormValues] = useState({
    firstname: "",
    lastname: "",
    familyname: "",
    position: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] =
    useState(false);

  useEffect(() => {
    if (!user) return;
    setFormValues({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      familyname: user.familyname || "",
      position: user.position || "",
      phone: user.phone || "",
    });
  }, [user]);

  if (checkingAuth || !user) return null;

  const handleInputChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateMyProfile(formValues);
      await fetchMe();
      addToast({
        type: "success",
        message: "Profil mis a jour",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de mettre a jour le profil",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormValues({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      familyname: user.familyname || "",
      position: user.position || "",
      phone: user.phone || "",
    });
  };

  const handlePasswordFieldChange = (field) => (event) => {
    setPasswordValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePasswordChange = async () => {
    if (!passwordValues.currentPassword) {
      addToast({
        type: "error",
        message: "Mot de passe actuel requis",
      });
      return;
    }

    if (!passwordValues.newPassword) {
      addToast({
        type: "error",
        message: "Nouveau mot de passe requis",
      });
      return;
    }

    if (
      passwordValues.newPassword !==
      passwordValues.confirmPassword
    ) {
      addToast({
        type: "error",
        message:
          "La confirmation ne correspond pas",
      });
      return;
    }

    try {
      setChangingPassword(true);
      await changeMyPassword({
        currentPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword,
      });
      setPasswordValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      addToast({
        type: "success",
        message: "Mot de passe modifie",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de modifier le mot de passe",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({
        type: "error",
        message: "Veuillez choisir une image",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      addToast({
        type: "error",
        message: `Le fichier depasse la taille maximale autorisee (${MAX_AVATAR_SIZE_MB} Mo).`,
      });
      event.target.value = "";
      return;
    }

    try {
      setAvatarLoading(true);
      await updateMyAvatar(file);
      await fetchMe();
      addToast({
        type: "success",
        message: "Avatar mis a jour",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de mettre a jour l'avatar",
      });
    } finally {
      setAvatarLoading(false);
      event.target.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setConfirmOpen(false);
      await deleteMyAccount();
      addToast({
        type: "success",
        message: "Compte desactive",
      });
      await logout(true);
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de desactiver le compte",
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <ConfirmModal
        open={confirmOpen}
        title="Desactiver le compte"
        description="Voulez-vous vraiment desactiver votre compte ?"
        confirmLabel="Desactiver"
        cancelLabel="Annuler"
        onConfirm={handleDeleteAccount}
        onClose={() => setConfirmOpen(false)}
      />

      <div className="bg-white border rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              Mon profil
            </p>
            <p className="text-xs text-neutral-400">
              Mettez a jour vos informations
            </p>
          </div>
          <span className="text-xs text-neutral-400">
            {user.role}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center text-xs text-neutral-500">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              "IMG"
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer">
              {avatarLoading ? "Chargement..." : "Changer photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
              />
            </label>
            <span className="text-xs text-neutral-400">
              Taille max: {MAX_AVATAR_SIZE_MB} Mo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prenom"
            value={formValues.firstname}
            onChange={handleInputChange("firstname")}
          />
          <Input
            label="Postnom"
            value={formValues.familyname}
            onChange={handleInputChange("familyname")}
          />
          <Input
            label="Nom"
            value={formValues.lastname}
            onChange={handleInputChange("lastname")}
          />
          <Input
            label="Poste"
            value={formValues.position}
            onChange={handleInputChange("position")}
          />
          <Input
            label="Telephone"
            value={formValues.phone}
            onChange={handleInputChange("phone")}
          />
          <div className="w-full flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Email
            </label>
            <div className="px-3 py-2 rounded-md border border-gray-200 bg-neutral-50 text-sm text-neutral-600">
              {user.email}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            buttonStyle
            className="px-4 py-2 rounded-lg"
            onClick={handleSave}
            loading={saving}
          >
            Enregistrer
          </Button>
          <Button
            buttonStyle={false}
            className="px-4 py-2 rounded-lg"
            onClick={handleReset}
            disabled={saving}
          >
            Annuler
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            Modifier le mot de passe
          </p>
          <p className="text-xs text-neutral-400">
            Utilisez un mot de passe robuste
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            value={passwordValues.currentPassword}
            onChange={handlePasswordFieldChange(
              "currentPassword"
            )}
          />
          <div />
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={passwordValues.newPassword}
            onChange={handlePasswordFieldChange(
              "newPassword"
            )}
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={passwordValues.confirmPassword}
            onChange={handlePasswordFieldChange(
              "confirmPassword"
            )}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            buttonStyle
            className="px-4 py-2 rounded-lg"
            onClick={handlePasswordChange}
            loading={changingPassword}
          >
            Mettre a jour
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            Zone dangereuse
          </p>
          <p className="text-xs text-neutral-400">
            Desactiver votre compte utilisateur
          </p>
        </div>
        <Button
          buttonStyle={false}
          className="px-4 py-2 rounded-lg text-red-600 border border-red-200"
          onClick={() => setConfirmOpen(true)}
        >
          Desactiver le compte
        </Button>
      </div>
    </div>
  );
};

export default SetProfile;
