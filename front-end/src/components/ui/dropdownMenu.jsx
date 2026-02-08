import { useEffect, useRef, useState } from "react"

export default function DropdownMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Fermer si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Bouton */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Options
      </button>

      {/* Menu */}
      {open && (
        <ul className="absolute right-0 mt-2 w-48 rounded-md bg-white border shadow-lg text-sm z-50 animate-scale-in origin-top-right">
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            ✏️ Modifier
          </li>
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            📄 Dupliquer
          </li>
          <li className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer">
            🗑️ Supprimer
          </li>
        </ul>
      )}
    </div>
  )
}
