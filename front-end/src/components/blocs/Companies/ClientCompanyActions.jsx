import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";

const ClientCompanyActions = ({ company, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1 rounded hover:bg-gray-100"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={`absolute right-0 w-40 bg-white border rounded shadow z-20 animate-scale-in ${
            menuPlacement === "up"
              ? "bottom-full mb-2 origin-bottom-right"
              : "mt-2 origin-top-right"
          }`}
        >
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
