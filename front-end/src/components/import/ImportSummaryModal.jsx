const ImportSummaryModal = ({ open, result, onClose }) => {
  if (!open || !result) return null;

  const { summary, errors } = result;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          Import terminé
        </h2>

        {/* ✅ RÉSUMÉ */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 text-green-700 rounded-lg p-3">
            <p className="text-xl font-bold">
              {summary?.created ?? 0}
            </p>
            <p className="text-xs">Succès</p>
          </div>

          <div className="bg-red-50 text-red-700 rounded-lg p-3">
            <p className="text-xl font-bold">
              {summary?.failed ?? 0}
            </p>
            <p className="text-xs">Échecs</p>
          </div>

          <div className="bg-neutral-100 text-neutral-700 rounded-lg p-3">
            <p className="text-xl font-bold">
              {summary?.total ?? 0}
            </p>
            <p className="text-xs">Total</p>
          </div>
        </div>

        {/* ❌ ERREURS DÉTAILLÉES */}
        {errors?.length > 0 && (
          <div className="max-h-48 overflow-auto border rounded-md p-3 text-sm">
            <p className="font-medium text-red-600 mb-2">
              Détails des erreurs :
            </p>
            <ul className="list-disc pl-4 space-y-1">
              {errors.map((e, idx) => (
                <li key={idx} className="text-neutral-700">
                  Ligne {e.line} : {e.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-2 w-full py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default ImportSummaryModal;
