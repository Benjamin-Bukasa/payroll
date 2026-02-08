import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './../components/blocs/Sidebar';
import Navbar from '../components/blocs/Navbar';
import { useUIStore } from '../store/UiStore';

const DashboardLayout = () => {

    const open = useUIStore((s) => s.open);

  return (
    <>
      <section className="h-screen xl:w-full xl:h-screen xl:flex font-inter overflow-hidden">
        <Sidebar/>
        <main className={`xl:flex-1 xl:flex xl:flex-col transition-all duration-300 ease-in-out h-screen ${open ?"ml-64":"ml-20"}`}>
          <Navbar/>
          <div className="flex-1 min-h-0 overflow-auto">
            <Outlet/>
          </div>
        </main>
      </section>
    </>
  );
}

export default DashboardLayout;
