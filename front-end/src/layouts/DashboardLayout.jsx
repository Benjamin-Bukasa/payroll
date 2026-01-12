import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './../components/blocs/Sidebar';
import Navbar from '../components/blocs/Navbar';

const DashboardLayout = () => {
  return (
    <>
      <section className="xl:w-full xl:h-screen xl:flex font-inter">
        <Sidebar/>
        <main className='xl:flex-1 xl:flex xl:flex-col xl:'>
          <Navbar/>
          <div className="">
            <Outlet/>
          </div>
        </main>
      </section>
    </>
  );
}

export default DashboardLayout;
