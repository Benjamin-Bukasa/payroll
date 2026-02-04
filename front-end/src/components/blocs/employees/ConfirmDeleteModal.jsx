import { CircleXIcon, DeleteIcon } from "lucide-react";
import Button from "../../ui/Button";

const ConfirmDeleteModal = ({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-neutral-800 text-left">
          {title}
        </h3>

        <div className="flex items-center justify-start gap-3 text-left text-neutral-600">
            <span className="h-10 w-10 rounded-full text-center p-1 text-red-500">
                <CircleXIcon size={32}/>
            </span>
            <p className="text-left text-sm text-neutral-600">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            buttonStyle={false}
            className="px-4 py-2 rounded-lg"
            onClick={onCancel}
          >
            Annuler
          </Button>

          <Button
            className="px-4 py-2 rounded-lg"
            buttonStyle={true}
            onClick={onConfirm}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
