import React from "react";
import Button from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/UiStore";

const UserProfileCard = () => {
  const user = useAuthStore((s) => s.user);
  const checkingAuth = useAuthStore((s) => s.checkingAuth);
  const open = useUIStore((s) => s.open);
  const navigate = useNavigate();

  if (checkingAuth || !user) return null;

  return (
    <div className="w-full flex items-center justify-between px-4 py-4 border-t">
      <div className="flex items-center gap-2">
        <div
          className="bg-neutral-100 rounded-full w-9 h-9 cursor-pointer overflow-hidden"
          onClick={() => navigate(`settings/profile/${user.id}`)}
        >
          <img
            src={user.avatar || "/avatar.png"}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {open && (
          <div className="text-[12px]">
            <p className="font-medium text-neutral-900">
              {user.firstname} {user.lastname}
            </p>
            <p className="text-neutral-500">{user.role}</p>
          </div>
        )}
      </div>

      {open && (
        <Button
          className="w-6 h-6 flex items-center justify-center rounded-full"
          onClick={() => navigate(`settings/profile/${user.id}`)}
        >
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
};

export default UserProfileCard;
