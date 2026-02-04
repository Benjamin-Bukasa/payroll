import { useState } from "react";
import ImportDropzone from "../../import/ImportDropezone";
import Button from "../../ui/button";

const ImportAttendanceForm = () => {
  const [file, setFile] = useState(null);

  const handleImport = () => {
    console.log("IMPORT FILE", file);
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-indigo-600 pb-3 border-b">
        Importer un pointage mensuel
      </h3>

      <ImportDropzone onFile={setFile} />

      {file && (
        <p className="text-sm text-neutral-600">
          Fichier sélectionné : {file.name}
        </p>
      )}

      <Button
        buttonStyle
        disabled={!file}
        onClick={handleImport}
        className="w-full px-4 py-2 rounded-lg"
      >
        Importer le fichier
      </Button>
    </div>
  );
};

export default ImportAttendanceForm;
