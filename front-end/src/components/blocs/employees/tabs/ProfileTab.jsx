import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Controller, useFormContext } from "react-hook-form";
import Input from "../../../ui/input";
import Button from "../../../ui/button";
import ConfirmModal from "../../../ui/confirmModal";
import { useEmployeeStore } from "../../../../store/employeeStore";
import { useToastStore } from "../../../../store/toastStore";

const MAX_AVATAR_SIZE_MB = 5;
const MAX_AVATAR_SIZE_BYTES =
  MAX_AVATAR_SIZE_MB * 1024 * 1024;
const MAX_AVATAR_DIMENSION = 2000;

const ProfileTab = () => {
  const { id } = useParams();
  const { control, setValue, watch } = useFormContext();
  const { updateEmployeeAvatar, deleteEmployeeAvatar } =
    useEmployeeStore();
  const addToast = useToastStore((s) => s.addToast);
  const [uploading, setUploading] = useState(false);
  const [uploadErrorOpen, setUploadErrorOpen] =
    useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] =
    useState("");
  const uploadErrorTitle =
    uploadErrorMessage
      ?.toLowerCase()
      .includes("taille")
      ? "Fichier trop volumineux"
      : "Erreur upload";
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const avatar = watch("avatar");
  const avatarUrl =
    typeof avatar === "string"
      ? avatar
      : avatar?.secure_url || avatar?.url || avatar?.path || "";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearPendingFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setPendingFile(null);
  };

  const isImageFile = (file) => {
    if (file.type?.startsWith("image/")) return true;
    return /\.(png|jpe?g|webp|gif)$/i.test(file.name);
  };

  const handleFileSelection = async (file) => {
    if (!file || !id) return;

    if (!isImageFile(file)) {
      setUploadErrorMessage(
        "Format non supporte. Utilisez une image (PNG, JPG, WEBP, GIF)."
      );
      setUploadErrorOpen(true);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setUploadErrorMessage(
        `Le fichier depasse la taille maximale autorisee (${MAX_AVATAR_SIZE_MB} Mo).`
      );
      setUploadErrorOpen(true);
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (
        img.width > MAX_AVATAR_DIMENSION ||
        img.height > MAX_AVATAR_DIMENSION
      ) {
        URL.revokeObjectURL(fileUrl);
        setUploadErrorMessage(
          `Les dimensions de l'image depassent ${MAX_AVATAR_DIMENSION}x${MAX_AVATAR_DIMENSION}px.`
        );
        setUploadErrorOpen(true);
        return;
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPendingFile(file);
      setPreviewUrl(fileUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(fileUrl);
      setUploadErrorMessage(
        "Impossible de lire l'image selectionnee."
      );
      setUploadErrorOpen(true);
    };

    img.src = fileUrl;
  };

  const handleFileUpload = async () => {
    if (!pendingFile || !id) return;

    setUploading(true);
    const updated = await updateEmployeeAvatar(
      id,
      pendingFile
    );
    setUploading(false);

    if (updated?.error) {
      setUploadErrorMessage(updated.error);
      setUploadErrorOpen(true);
      return;
    }

    if (updated?.avatar) {
      setValue("avatar", updated.avatar);
      clearPendingFile();
      addToast({
        type: "success",
        message: "Photo de profil mise a jour",
      });
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    await handleFileSelection(file);
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    await handleFileSelection(file);
  };

  const handleAvatarDelete = async () => {
    if (!id) return;

    setUploading(true);
    const updated = await deleteEmployeeAvatar(id);
    setUploading(false);

    if (updated) {
      setValue("avatar", null);
      addToast({
        type: "success",
        message: "Photo de profil supprimee",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <ConfirmModal
        open={uploadErrorOpen}
        title={uploadErrorTitle}
        description={uploadErrorMessage}
        confirmLabel="OK"
        hideCancel
        onConfirm={() => setUploadErrorOpen(false)}
        onClose={() => setUploadErrorOpen(false)}
      />

      <div
        className={`relative md:col-span-2 flex flex-wrap items-center gap-4 rounded-lg border border-dashed p-4 transition ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-neutral-200"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          fileInputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-indigo-600">
            Drop ici
          </div>
        )}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center text-xs">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            "IMG"
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold cursor-pointer"
            onClick={(event) => event.stopPropagation()}
          >
            {uploading ? "Chargement..." : "Changer photo"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
          <span className="text-xs text-neutral-400">
            Taille max: {MAX_AVATAR_SIZE_MB} Mo
          </span>
          <span className="text-xs text-neutral-400">
            Glisser-deposer ou cliquer pour choisir
          </span>

          {avatarUrl && (
            <Button
              type="button"
              buttonStyle={false}
              className="px-4 py-2 rounded-lg"
              onClick={(event) => {
                event.stopPropagation();
                handleAvatarDelete();
              }}
              loading={uploading}
            >
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="md:col-span-2 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100">
            <img
              src={previewUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-700">
              {pendingFile?.name}
            </p>
            <p className="text-xs text-neutral-400">
              Apercu avant upload
            </p>
          </div>
          <Button
            buttonStyle
            className="px-4 py-2 rounded-lg"
            onClick={handleFileUpload}
            loading={uploading}
          >
            Uploader
          </Button>
          <Button
            type="button"
            buttonStyle={false}
            className="px-4 py-2 rounded-lg"
            onClick={clearPendingFile}
            disabled={uploading}
          >
            Annuler
          </Button>
        </div>
      )}

      <Controller
        name="firstname"
        control={control}
        render={({ field }) => (
          <Input label="Prénom" {...field} />
        )}
      />

      <Controller
        name="lastname"
        control={control}
        render={({ field }) => (
          <Input label="Nom" {...field} />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <Input label="Téléphone" {...field} />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input label="Email" {...field} />
        )}
      />
    </div>
  );
};

export default ProfileTab;
