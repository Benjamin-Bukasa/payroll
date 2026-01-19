import React from "react";
import Button from "../ui/button";
import { LogOut, X } from "lucide-react";

const ConfirmLogoutModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Déconnexion
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-neutral-600 mb-6">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>

        <div className="flex items-center justify-end gap-3 rounded-lg">
          <Button
            buttonStyle={false}
            className="px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
            onClick={onClose}
          >
            Annuler
          </Button>

          <Button
            className="px-4 py-2  text-white flex items-center gap-2 rounded-lg"
            onClick={onConfirm}
            buttonStyle={true}
          >
            <LogOut size={16} />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
