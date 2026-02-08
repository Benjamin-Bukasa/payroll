import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import ConfirmModal from "../../ui/confirmModal";

const AttendanceActions = ({
  attendance,
  onEdit,
  onDelete,
  onView,
}) => {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState("down");
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleScroll = () => {
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true
      );
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const updatePlacement = () => {
      if (!ref.current || !menuRef.current) return;
      const triggerRect = ref.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const spaceBelow =
        window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const shouldOpenUp =
        spaceBelow < menuHeight && spaceAbove > spaceBelow;
      setMenuPlacement(shouldOpenUp ? "up" : "down");
    };
    requestAnimationFrame(updatePlacement);
  }, [open]);

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div
            ref={menuRef}
            className={`absolute right-0 w-44 bg-white border rounded-lg shadow z-20 overflow-hidden animate-scale-in ${
              menuPlacement === "up"
                ? "bottom-full mb-2 origin-bottom-right"
                : "mt-2 origin-top-right"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onView?.(attendance);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
            >
              <Eye size={16} />
              Detail
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit?.(attendance);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
            >
              <Pencil size={16} />
              Modifier
            </button>

            <button
              type="button"
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

      <ConfirmModal
        open={confirmOpen}
        title="Supprimer un pointage"
        description="Voulez-vous vraiment supprimer ce pointage ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete?.(attendance);
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default AttendanceActions;
