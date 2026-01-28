import React, { useRef } from "react";
import { UploadCloud } from "lucide-react";

const ImportDropzone = ({ onFile }) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFile(file);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-50 transition"
      >
        <UploadCloud className="text-indigo-600" size={28} />
        <p className="text-sm text-neutral-700">
          Glissez un fichier Excel ou CSV ici
        </p>
        <p className="text-xs text-neutral-400">
          ou cliquez pour sélectionner
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        hidden
        onChange={handleChange}
      />
    </>
  );
};

export default ImportDropzone;
