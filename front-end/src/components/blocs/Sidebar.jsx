import React from 'react';
import LogoCard from "./LogoCard"
import UserProfileCard from './UserProfileCard';
import SidebarItems from './SidebarItems';

const Sidebar = () => {
  return (
    <aside className='xl:w-64 xl:h-screen xl:flex xl:flex-col xl:justify-between xl:items-center border-r'>
      <LogoCard/>
      <div className="xl:w-full xl:h-3/4">
        <SidebarItems/>
      </div>
      <UserProfileCard/>
    </aside>
  );
}

export default Sidebar;
