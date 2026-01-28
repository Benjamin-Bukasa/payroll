import { useState } from "react";
import Button from "../../ui/button";
import ImportDropzone from "../../import/ImportDropezone";
import ImportSummaryModal from "../../import/ImportSummaryModal";
import { downloadClientCompanyTemplate } from "../../../api/importClientCompany";
import { useClientCompanyImportStore } from "../../../store/clientCompanyImportStore";

const ImportClientCompanyForm = () => {
  const [file, setFile] = useState(null);

  const {
    uploadFile,
    loading,
    error,
    result,
    clearResult,
  } = useClientCompanyImportStore();

  const handleUpload = async () => {
    if (!file) return;
    await uploadFile(file);
  };

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        {/* DOWNLOAD TEMPLATE */}
        <Button
          buttonStyle={false}
          className="py-2 px-4 border rounded-md hover:bg-indigo-50"
          onClick={downloadClientCompanyTemplate}
        >
          Télécharger le template
        </Button>

        {/* DROPZONE */}
        <ImportDropzone onFile={setFile} />

        {/* FILE NAME */}
        {file && (
          <p className="text-sm text-neutral-600">
            Fichier sélectionné :{" "}
            <span className="font-medium">{file.name}</span>
          </p>
        )}

        {/* ERROR */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <Button
          buttonStyle
          className="py-2 px-4 rounded-md hover:bg-indigo-700"
          loading={loading}
          disabled={!file || loading}
          onClick={handleUpload}
        >
          Importer
        </Button>
      </div>

      {/* SUMMARY MODAL */}
      <ImportSummaryModal
        open={Boolean(result)}
        result={result}
        onClose={clearResult}
      />
    </>
  );
};

export default ImportClientCompanyForm;
