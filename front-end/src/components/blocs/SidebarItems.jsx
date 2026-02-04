import {
  Home,
  Building2,
  SquareCheck,
  User,
  LogOut,
  Database,
  FileText,
  Bell,
  Settings,
  FolderOpen,
  CircleArrowOutUpLeft,
} from "lucide-react";
import React from "react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUIStore } from "../../store/UiStore";
import { useAuthStore } from "../../store/authStore";
import ConfirmLogoutModal from './../auth/ConfirmLogoutModal';


const menuItems = [
  { to: "/dashboard", label: "Accueil", icon: Home },
  { to: "/client-companies", label: "Entreprises", icon: Building2 },
  { to: "/employees", label: "Employés", icon: User },
  { to: "/attendance", label: "Pointages", icon: SquareCheck },
  { to: "/leaves", label: "Congé", icon: LogOut },
  { to: "/payroll", label: "Paie", icon: Database },
  { to: "/report", label: "Rapport", icon: FileText },
];

const userItems = [
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Paramètres", icon: Settings },
  { to: "/folders", label: "Documents", icon: FolderOpen }
];

const SidebarItems = () => {

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const open = useUIStore((s) => s.open);
  const logout = useAuthStore((s) => s.logout);

  const renderItem = ({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `
        w-full flex items-center gap-4 px-3 py-2 rounded-md
        transition-colors
        ${
          isActive
            ? "bg-neutral-100 text-neutral-700"
            : "text-neutral-500 hover:bg-neutral-50"
        }
      `
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={20}
            className={isActive ? "text-indigo-600" : ""}
          />
          {open && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );

  return (
    <div className={`w-full h-full flex flex-col justify-between ${open?"":"items-center"} px-2 py-4`}>
      <div className="flex flex-col gap-4">
        {open && (
          <h3 className="text-neutral-500 font-medium text-[13px] px-2">
            MENU
          </h3>
        )}
        <ul className="flex flex-col gap-2">
          {menuItems.map(renderItem)}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        {open && (
          <h3 className="text-neutral-500 font-medium text-[13px] px-2">
            UTILISATEUR
          </h3>
        )}
        <ul className="flex flex-col gap-2">
          {userItems.map(renderItem)}

        </ul>
        <button
            onClick={() => setShowLogoutModal(true)}
            className={`
              w-full flex items-center ${open ?"":"justify-center"}  gap-4 py-2 px-2 rounded-lg
             text-neutral-500 hover:text-red-500 hover:bg-red-50 transition
            `}
          >
            <CircleArrowOutUpLeft size={20} />
            {open && <span>Déconnexion</span>}
          </button>
      </div>
      <ConfirmLogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await logout();
          navigate("/login", { replace: true });
  }}
/>
    </div>
  );
};

export default SidebarItems;
