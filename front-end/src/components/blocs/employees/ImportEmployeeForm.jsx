import { useState } from "react";
import Button from "../../ui/button";
import ImportDropzone from "../../import/ImportDropezone";
import ImportSummaryModal from "../../import/ImportSummaryModal";
import { useEmployeeImportStore } from "../../../store/employeeImportStore";
import { downloadEmployeeTemplate } from "../../../api/importEmployee";

const ImportEmployeeForm = () => {
  const [file, setFile] = useState(null);

  const {
    uploadFile,
    loading,
    error,
    result,
    clearResult,
  } = useEmployeeImportStore();

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button
          buttonStyle={false}
          className={"py-2 px-4 rounded-lg"}
          onClick={downloadEmployeeTemplate}
        >
          Télécharger le template employés
        </Button>

        <ImportDropzone onFile={setFile} />

        {file && (
          <p className="text-sm text-neutral-600">
            Fichier sélectionné : {file.name}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
        buttonStyle={true}
          loading={loading}
          className={"py-2 px-4 rounded-lg"}
          disabled={!file}
          onClick={() => uploadFile(file)}
        >
          Importer les employés
        </Button>
      </div>

      <ImportSummaryModal
        open={!!result}
        result={result}
        onClose={clearResult}
      />
    </>
  );
};

export default ImportEmployeeForm;
