// src/components/import/ImportSummaryModal.jsx
import Button from "../ui/button";

const ImportSummaryModal = ({ open, onClose, result }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          📊 Résumé de l'import
        </h2>

        <ul className="text-sm space-y-1">
          <li>✅ Créés : {result.created || 0}</li>
          <li>⚠️ Ignorés : {result.skipped || 0}</li>
          <li>❌ Erreurs : {result.errors?.length || 0}</li>
        </ul>

        {result.errors?.length > 0 && (
          <div className="max-h-40 overflow-auto border rounded p-2 text-xs text-red-600">
            {result.errors.map((e, i) => (
              <p key={i}>• {e}</p>
            ))}
          </div>
        )}

        <Button
          onClick={onClose}
          className="self-end px-4 py-2"
          buttonStyle
        >
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default ImportSummaryModal;
