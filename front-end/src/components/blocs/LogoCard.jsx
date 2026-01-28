import React from "react";
import Button from "../ui/button";
import { HandCoins, ChevronLeft } from "lucide-react";
import { useUIStore } from "../../store/UiStore";

const LogoCard = () => {
  const open = useUIStore((s) => s.open);
  const toggleOpen = useUIStore((s) => s.toggleOpen);

  return (
    <div className="w-full flex items-center justify-between gap-2 py-6 px-4 border-b">
      <div className="flex items-center gap-2 text-indigo-500">
        <HandCoins size={30} />
        {open && (
          <span className="text-xl font-semibold text-neutral-900">
            Neopayroll
          </span>
        )}
      </div>

      <Button
        onClick={toggleOpen}
        className={`
          w-6 h-6 flex items-center justify-center rounded-full
          transition-transform
          ${!open ? "rotate-180" : ""}
        `}
      >
        <ChevronLeft size={16} />
      </Button>
    </div>
  );
};

export default LogoCard;
