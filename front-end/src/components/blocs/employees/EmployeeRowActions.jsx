import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

const EmployeeRowActions = ({ employee, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:bg-gray-100"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-20">
          <button
            onClick={() => onEdit(employee)}
            className="w-full px-3 py-2 text-left hover:bg-gray-100"
          >
            Modifier
          </button>

          <button
            onClick={() => onDelete(employee)}
            className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeRowActions;
