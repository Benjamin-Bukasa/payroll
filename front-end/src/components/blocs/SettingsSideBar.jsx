import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Button from "../ui/button";
import {
  User,
  Building2,
  ReceiptText,
  ShieldCheck,
  BellDot,
  HandCoins,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { to: "/settings/profile", label: "Profile", icon: User },
  { to: "/settings/company", label: "Entreprise", icon: Building2 },
  { to: "/settings/billing", label: "Facturation", icon: ReceiptText },
  { to: "/settings/security", label: "Sécurité", icon: ShieldCheck },
  { to: "/settings/notifications", label: "Notification", icon: BellDot },
  { to: "/settings/payroll", label: "Payroll", icon: HandCoins },
];

const SettingsSideBar = () => {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`
        ${open ? "w-64" : "w-16"}
        h-full p-3 flex flex-col transition-all duration-300
      `}
    >
      {/* TOGGLE */}
      <div className={`${open ? "text-right" : "text-center"} w-full mb-4`}>
        <Button className="rounded-lg p-1" onClick={() => setOpen(!open)}>
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      {/* MENU */}
      <ul className="w-full flex flex-col gap-4">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `
              w-full flex items-center
              ${open ? "justify-start px-3" : "justify-center"}
              py-2 rounded-lg transition
              ${
                isActive
                  ? "bg-neutral-100 text-neutral-600"
                  : "text-neutral-500 hover:bg-neutral-50"
              }
            `
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={open ? 18 : 18} // 👈 ICÔNE PLUS GRANDE QUAND FERMÉ
                  className={
                    isActive
                      ? "text-indigo-600"
                      : "text-neutral-500"
                  }
                />

                {open && (
                  <span className="ml-3 text-sm whitespace-nowrap">
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </ul>
    </div>
  );
};

export default SettingsSideBar;
