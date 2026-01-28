import React from "react";
import LogoCard from "./LogoCard";
import UserProfileCard from "./UserProfileCard";
import SidebarItems from "./SidebarItems";
import { useUIStore } from "../../store/uiStore";

const Sidebar = () => {
  const open = useUIStore((s) => s.open);

  return (
    <aside
      className={`fixed z-20 bg-white
        h-screen flex flex-col justify-between items-center border-r
        transition-all duration-300 ease-in-out
        ${open ? "xl:w-64 w-64" : "xl:w-20 w-20"}
      `}
    >
      <LogoCard />
      <div className="w-full flex-1 py-4">
        <SidebarItems />
      </div>
      <UserProfileCard />
    </aside>
  );
};

export default Sidebar;
