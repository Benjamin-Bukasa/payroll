import React from "react";
import { CheckCircle } from "lucide-react";
import Button from "./button";

const SuccessModal = ({ open, title, message, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            {title}
          </h2>
        </div>

        <p className="text-sm text-neutral-600">
          {message}
        </p>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} className="px-4 py-2 rounded-lg" buttonStyle={true}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
