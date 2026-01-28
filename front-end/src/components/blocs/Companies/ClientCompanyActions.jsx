import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";

const ClientCompanyActions = ({ company, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1 rounded hover:bg-gray-100"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-20">
          <button
            onClick={() => {
              setOpen(false);
              onView(company);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
          >
            <Eye size={16} />
            Détails
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onEdit(company);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
          >
            <Pencil size={16} />
            Modifier
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onDelete(company);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-600"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientCompanyActions;
