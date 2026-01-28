import Button from "../../ui/Button";

const ConfirmDeleteModal = ({ open, title, description, onConfirm, onClose, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-neutral-600">{description}</p>

        <div className="flex justify-end gap-4">
          <Button 
          buttonStyle={false} 
          onClick={onClose}
          className="px-4 py-2 rounded-lg"
          >
            Annuler
          </Button>
          <Button
          buttonStyle={true}
            loading={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
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
