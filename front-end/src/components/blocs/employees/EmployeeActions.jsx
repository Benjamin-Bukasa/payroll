import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const EmployeeActions = ({ employee, onEdit, onDelete, onView }) => {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef(null);

  /* =========================
     CLICK OUTSIDE → CLOSE
  ========================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow z-20 overflow-hidden">
            {/* 👁️ DÉTAIL */}
            <button
              onClick={() => {
                setOpen(false);
                onView?.(employee);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
            >
              <Eye size={16} />
              Détail
            </button>

            {/* ✏️ MODIFIER */}
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

            {/* 🗑️ SUPPRIMER */}
            <button
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-600 text-left"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* ✅ MODAL CONFIRMATION */}
      <ConfirmDeleteModal
        open={confirmOpen}
        title="Supprimer l’employé"
        message={`Voulez-vous vraiment supprimer  ${employee.firstname} ${employee.lastname} ? Cette action est irréversible.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(employee);
        }}
      />
    </>
  );
};

export default EmployeeActions;
