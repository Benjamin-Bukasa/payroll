import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

const EmployeeActions = ({ employee, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  if (!employee.canEdit && !employee.canDelete) return null;

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
          {employee.canEdit && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit(employee);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
            >
              <Pencil size={16} />
              Modifier
            </button>
          )}

          {employee.canDelete && (
            <button
              onClick={() => {
                setOpen(false);
                onDelete(employee);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-600 text-left"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeActions;
