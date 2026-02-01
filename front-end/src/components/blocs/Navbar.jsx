import React from "react";
import Button from "../ui/button";
import SearchForm from "../ui/search-form";
import { useAuthStore } from "../../store/authStore";
import { Bell, CalendarDays, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const user = useAuthStore((s) => s.user);
  const checkingAuth = useAuthStore((s) => s.checkingAuth);
  const navigate = useNavigate()

  if (checkingAuth || !user) return null;

  return (
    <header className="sticky top-0 bg-white z-10 w-full flex items-center justify-between gap-4 py-3.5 px-4 border-b">
      <div className="flex flex-col items-start gap-0.5">
        <p className="flex items-center gap-1 text-xl font-semibold">
          <span>Bienvenue,</span>
          <span className="text-[#6366F1]">
            {user.firstname} !
          </span>
        </p>
        <p className="text-[13px] font-medium">Accueil</p>
      </div>

      <div className="flex items-center gap-4">
        <SearchForm />

        <div className="flex items-center gap-4 border-l px-4 text-neutral-500">
          <Bell />

          <Button
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-neutral-500"
            buttonStyle={false}
            onClick={()=>navigate(`/createAttendance`)}
          >
            <CalendarDays size={16} />
            <span className="text-neutral-600">Attendance</span>
          </Button>

          <Button
            className="flex items-center gap-2 px-6 py-3 rounded-lg"
            buttonStyle={true}
            onClick={()=>navigate(`/createEmployee`)}
          >
            <Plus size={16} />
            <span>Employé(e)</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
