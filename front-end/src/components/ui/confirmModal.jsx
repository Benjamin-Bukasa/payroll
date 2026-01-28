import React from "react";
import Button from "./button";

const ConfirmModal = ({
  open,
  title = "Confirmation",
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onClose,
  hideCancel = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg animate-scale-in">
        <h2 className="text-lg font-semibold text-neutral-900">
          {title}
        </h2>

        <p className="text-sm text-neutral-600 mt-2">
          {description}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          {!hideCancel && (
            <Button
              buttonStyle={false}
              className="px-4 py-2"
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
          )}

          <Button
            buttonStyle
            className="px-4 py-2"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
